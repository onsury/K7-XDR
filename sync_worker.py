K7 AegisXDR — Wazuh Sync Worker
=================================
Standalone background service that continuously syncs data from
Wazuh server into AegisXDR MongoDB.

Runs as its own container in Docker Compose.
Interval-based polling of Wazuh REST API.

SYNC OPERATIONS:
  1. Agent Sync → Fleet Command (every 5 min)
  2. Alert Sync → Convergence Dashboard (every 60 sec)
  3. Vulnerability Sync → Vuln Dashboard (every 30 min)

USAGE:
  python -m sync_worker
"""

import asyncio
import os
import logging
import httpx
import uuid
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [SYNC] %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WazuhSyncWorker:
    def __init__(self):
        # MongoDB
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'aegisxdr')
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]

        # Wazuh API
        self.base_url = os.environ.get('WAZUH_API_URL', 'https://localhost:55000')
        self.username = os.environ.get('WAZUH_API_USER', 'wazuh-wui')
        self.password = os.environ.get('WAZUH_API_PASSWORD', '')
        self.verify_ssl = os.environ.get('WAZUH_VERIFY_SSL', 'false').lower() == 'true'

        # Intervals (seconds)
        self.agent_interval = int(os.environ.get('SYNC_AGENT_INTERVAL', 300))
        self.alert_interval = int(os.environ.get('SYNC_ALERT_INTERVAL', 60))
        self.vuln_interval = int(os.environ.get('SYNC_VULN_INTERVAL', 1800))

        # Auth
        self.token = None
        self.token_expires = None

    async def authenticate(self):
        if self.token and self.token_expires and datetime.now(timezone.utc) < self.token_expires:
            return self.token

        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=15.0) as client:
            response = await client.post(
                f"{self.base_url}/security/user/authenticate",
                auth=(self.username, self.password),
                headers={"Content-Type": "application/json"}
            )
            if response.status_code != 200:
                raise Exception(f"Wazuh auth failed: {response.status_code} - {response.text}")

            data = response.json()
            self.token = data["data"]["token"]
            self.token_expires = datetime.now(timezone.utc) + timedelta(minutes=12)
            logger.info("Wazuh authentication successful")
            return self.token

    async def api_call(self, method, endpoint, params=None, body=None):
        token = await self.authenticate()
        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=f"{self.base_url}{endpoint}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                params=params, json=body
            )
            if response.status_code == 401:
                self.token = None
                token = await self.authenticate()
                response = await client.request(
                    method=method,
                    url=f"{self.base_url}{endpoint}",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    params=params, json=body
                )
            if response.status_code not in [200, 201]:
                logger.error(f"API error: {method} {endpoint} → {response.status_code}")
                return {"error": response.status_code}
            return response.json()

    # ==================== AGENT SYNC ====================

    async def sync_agents(self):
        """Pull Wazuh agents → AegisXDR assets collection"""
        result = await self.api_call("GET", "/agents", params={"limit": 500})
        if "error" in result:
            logger.error(f"Agent sync failed: {result}")
            return

        agents = result.get("data", {}).get("affected_items", [])
        synced = new = updated = 0

        for agent in agents:
            wid = agent.get("id", "000")
            if wid == "000":
                continue

            status_map = {"active": "active", "disconnected": "offline",
                          "never_connected": "offline", "pending": "active"}
            os_info = agent.get("os", {})

            asset_data = {
                "hostname": agent.get("name", f"agent-{wid}"),
                "ip_address": agent.get("ip", "0.0.0.0"),
                "os_type": f"{os_info.get('platform', 'unknown')} {os_info.get('version', '')}".strip(),
                "status": status_map.get(agent.get("status", ""), "offline"),
                "agent_version": agent.get("version", "unknown"),
                "last_seen": agent.get("lastKeepAlive", datetime.now(timezone.utc).isoformat()),
                "tags": agent.get("group", ["default"]) if isinstance(agent.get("group"), list) else [agent.get("group", "default")],
                "location": agent.get("node_name", ""),
                "wazuh_agent_id": wid,
            }

            existing = await self.db.assets.find_one({"wazuh_agent_id": wid})
            if existing:
                await self.db.assets.update_one({"wazuh_agent_id": wid}, {"$set": asset_data})
                updated += 1
            else:
                asset_data["asset_id"] = f"asset_{uuid.uuid4().hex[:12]}"
                asset_data["risk_score"] = 0
                asset_data["department"] = ""
                asset_data["created_at"] = datetime.now(timezone.utc).isoformat()
                asset_data["user_id"] = None
                await self.db.assets.insert_one(asset_data)
                new += 1
            synced += 1

        logger.info(f"Agent sync: {synced} total, {new} new, {updated} updated")

    # ==================== ALERT SYNC ====================

    async def sync_alerts(self):
        """Pull Wazuh alerts → AegisXDR alerts collection"""
        since = (datetime.now(timezone.utc) - timedelta(seconds=self.alert_interval * 2)).strftime("%Y-%m-%dT%H:%M:%S+0000")
        result = await self.api_call("GET", "/alerts", params={
            "limit": 500, "sort": "-timestamp", "q": f"timestamp>{since}"
        })
        if "error" in result:
            logger.error(f"Alert sync failed: {result}")
            return

        alerts = result.get("data", {}).get("affected_items", [])
        new_count = 0

        for wa in alerts:
            wid = wa.get("id", "")
            if await self.db.alerts.find_one({"wazuh_alert_id": wid}):
                continue

            rule = wa.get("rule", {})
            level = rule.get("level", 0)
            severity = "critical" if level >= 12 else "high" if level >= 8 else "medium" if level >= 5 else "low"

            mitre = rule.get("mitre", {})
            agent = wa.get("agent", {})
            source_asset = await self.db.assets.find_one({"wazuh_agent_id": agent.get("id", "")})

            # Map rule groups to category
            groups = rule.get("groups", [])
            category = "intrusion"
            for g in groups:
                gl = g.lower()
                if gl in ("malware", "rootkit", "virus", "ransomware"):
                    category = "malware"
                    break
                elif "exfil" in gl:
                    category = "data_exfil"
                    break
                elif "lateral" in gl:
                    category = "lateral_movement"
                    break

            alert_data = {
                "alert_id": f"alert_{uuid.uuid4().hex[:12]}",
                "title": rule.get("description", "Wazuh Alert"),
                "description": f"Rule {rule.get('id', 'N/A')} (Level {level}): {rule.get('description', '')}",
                "severity": severity,
                "category": category,
                "source_asset_id": source_asset.get("asset_id") if source_asset else None,
                "source_ip": agent.get("ip", ""),
                "destination_ip": wa.get("data", {}).get("dstip", ""),
                "status": "open",
                "is_shadow": False,
                "raw_log": wa.get("full_log", "")[:5000],
                "indicators": mitre.get("id", []) if isinstance(mitre.get("id"), list) else [],
                "mitre_tactics": (mitre.get("tactic", []) if isinstance(mitre.get("tactic"), list) else []) +
                                 (mitre.get("id", []) if isinstance(mitre.get("id"), list) else []),
                "assigned_to": None,
                "wazuh_alert_id": wid,
                "wazuh_rule_id": rule.get("id", ""),
                "wazuh_rule_level": level,
                "wazuh_agent_id": agent.get("id", ""),
                "wazuh_groups": groups,
                "created_at": wa.get("timestamp", datetime.now(timezone.utc).isoformat()),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await self.db.alerts.insert_one(alert_data)
            new_count += 1

        if new_count > 0:
            logger.info(f"Alert sync: {new_count} new alerts ingested")

    # ==================== VULNERABILITY SYNC ====================

    async def sync_vulnerabilities(self):
        """Pull vulnerability data for all active agents"""
        agents_result = await self.api_call("GET", "/agents", params={"limit": 500, "select": "id", "status": "active"})
        if "error" in agents_result:
            return

        agents = agents_result.get("data", {}).get("affected_items", [])
        total_synced = 0

        for agent in agents:
            aid = agent.get("id", "000")
            if aid == "000":
                continue

            result = await self.api_call("GET", f"/vulnerability/{aid}", params={"limit": 100})
            if "error" in result:
                continue

            vulns = result.get("data", {}).get("affected_items", [])
            for vuln in vulns:
                cve = vuln.get("cve", "")
                vuln_data = {
                    "agent_id": aid,
                    "cve": cve,
                    "name": vuln.get("name", ""),
                    "version": vuln.get("version", ""),
                    "severity": vuln.get("severity", "low"),
                    "status": vuln.get("status", ""),
                    "detection_time": vuln.get("detection_time", ""),
                    "synced_at": datetime.now(timezone.utc).isoformat(),
                }
                await self.db.vulnerabilities.update_one(
                    {"agent_id": aid, "cve": cve},
                    {"$set": vuln_data},
                    upsert=True
                )
                total_synced += 1

        if total_synced > 0:
            logger.info(f"Vulnerability sync: {total_synced} vulnerabilities updated")

    # ==================== MAIN LOOP ====================

    async def run(self):
        logger.info(f"Wazuh Sync Worker starting...")
        logger.info(f"  Wazuh API: {self.base_url}")
        logger.info(f"  Agent sync: every {self.agent_interval}s")
        logger.info(f"  Alert sync: every {self.alert_interval}s")
        logger.info(f"  Vuln sync:  every {self.vuln_interval}s")

        # Wait for Wazuh to be ready
        for attempt in range(30):
            try:
                await self.authenticate()
                logger.info("Connected to Wazuh server")
                break
            except Exception as e:
                logger.warning(f"Waiting for Wazuh... attempt {attempt+1}/30: {e}")
                await asyncio.sleep(10)
        else:
            logger.error("Could not connect to Wazuh after 30 attempts. Exiting.")
            return

        # Start sync loops
        async def agent_loop():
            while True:
                try:
                    await self.sync_agents()
                except Exception as e:
                    logger.error(f"Agent sync error: {e}")
                await asyncio.sleep(self.agent_interval)

        async def alert_loop():
            while True:
                try:
                    await self.sync_alerts()
                except Exception as e:
                    logger.error(f"Alert sync error: {e}")
                await asyncio.sleep(self.alert_interval)

        async def vuln_loop():
            while True:
                try:
                    await self.sync_vulnerabilities()
                except Exception as e:
                    logger.error(f"Vuln sync error: {e}")
                await asyncio.sleep(self.vuln_interval)

        await asyncio.gather(agent_loop(), alert_loop(), vuln_loop())


if __name__ == "__main__":
    worker = WazuhSyncWorker()
    asyncio.run(worker.run())