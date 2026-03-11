K7 AegisXDR Platform — Complete Backend with Wazuh Integration
==============================================================
FastAPI + MongoDB + Wazuh Bridge + Scan Engine + Demo Mode

Architecture:
  [Wazuh Agents] → [Wazuh Server] → [This API] → [MongoDB] → [React Dashboard]
                                         ↑
                                  [Aegis Scan Engine]
"""

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import hashlib
import math
import struct
import json
import base64
import time
import asyncio
import random
from collections import Counter

# Configuration
ROOT_DIR = Path(__file__).parent

# MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'aegisxdr')]

# FastAPI
app = FastAPI(title="K7 AegisXDR API", version="2.0.0 — Wazuh Integration")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Demo mode flag — set to True when no real Wazuh server is available
DEMO_MODE = os.environ.get("AEGIS_DEMO_MODE", "true").lower() == "true"


# ==================== DATA MODELS ====================

class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "analyst"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    asset_id: str = Field(default_factory=lambda: f"asset_{uuid.uuid4().hex[:12]}")
    hostname: str
    ip_address: str
    os_type: str
    status: str = "active"
    agent_version: str = "4.9.0"
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    risk_score: int = 0
    tags: List[str] = []
    location: str = ""
    department: str = ""
    user_id: Optional[str] = None
    wazuh_agent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssetCreate(BaseModel):
    hostname: str
    ip_address: str
    os_type: str
    location: str = ""
    department: str = ""
    tags: List[str] = []

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    alert_id: str = Field(default_factory=lambda: f"alert_{uuid.uuid4().hex[:12]}")
    title: str
    description: str
    severity: str
    category: str
    source_asset_id: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    status: str = "open"
    is_shadow: bool = False
    raw_log: Optional[str] = None
    indicators: List[str] = []
    mitre_tactics: List[str] = []
    assigned_to: Optional[str] = None
    wazuh_alert_id: Optional[str] = None
    wazuh_rule_id: Optional[str] = None
    wazuh_rule_level: Optional[int] = None
    wazuh_agent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str
    category: str
    source_asset_id: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    raw_log: Optional[str] = None
    indicators: List[str] = []
    mitre_tactics: List[str] = []

class ShadowSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: f"shadow_{uuid.uuid4().hex[:12]}")
    asset_id: str
    alert_id: Optional[str] = None
    status: str = "active"
    capture_data: List[Dict[str, Any]] = []
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    reason: str = ""

class ShadowSessionCreate(BaseModel):
    asset_id: str
    alert_id: Optional[str] = None
    reason: str = ""

class Playbook(BaseModel):
    model_config = ConfigDict(extra="ignore")
    playbook_id: str = Field(default_factory=lambda: f"pb_{uuid.uuid4().hex[:12]}")
    name: str
    description: str
    trigger_conditions: List[str] = []
    actions: List[Dict[str, Any]] = []
    is_active: bool = True
    execution_count: int = 0
    wazuh_commands: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlaybookCreate(BaseModel):
    name: str
    description: str
    trigger_conditions: List[str] = []
    actions: List[Dict[str, Any]] = []
    wazuh_commands: List[str] = []

class ScanJob(BaseModel):
    model_config = ConfigDict(extra="ignore")
    scan_id: str = Field(default_factory=lambda: f"scan_{uuid.uuid4().hex[:12]}")
    filename: str
    file_size: int
    file_hash_sha256: str
    file_hash_md5: str
    file_type: str = "unknown"
    status: str = "queued"
    submitted_by: str = ""
    pass1_hash_lookup: Optional[Dict[str, Any]] = None
    pass2_static_analysis: Optional[Dict[str, Any]] = None
    pass3_entropy_analysis: Optional[Dict[str, Any]] = None
    pass4_yara_matches: Optional[List[Dict[str, Any]]] = None
    pass5_ai_analysis: Optional[Dict[str, Any]] = None
    cca_vector: Optional[Dict[str, float]] = None
    verdict: str = "pending"
    confidence_score: float = 0.0
    severity: str = "low"
    threat_name: Optional[str] = None
    threat_family: Optional[str] = None
    mitre_techniques: List[str] = []
    auto_report: Optional[str] = None
    alert_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


# ==================== WAZUH BRIDGE ====================

class WazuhBridge:
    """Bridge between Wazuh XDR/SIEM and AegisXDR. Zero licensing cost."""

    def __init__(self, database):
        self.db = database
        self.base_url = os.environ.get("WAZUH_API_URL", "https://localhost:55000")
        self.username = os.environ.get("WAZUH_API_USER", "wazuh-wui")
        self.password = os.environ.get("WAZUH_API_PASSWORD", "")
        self.verify_ssl = os.environ.get("WAZUH_VERIFY_SSL", "false").lower() == "true"
        self.token = None
        self.token_expires = None
        self.connected = False

    async def _authenticate(self) -> str:
        if self.token and self.token_expires and datetime.now(timezone.utc) < self.token_expires:
            return self.token
        async with httpx.AsyncClient(verify=self.verify_ssl) as http_client:
            response = await http_client.post(
                f"{self.base_url}/security/user/authenticate",
                auth=(self.username, self.password),
                headers={"Content-Type": "application/json"}
            )
            if response.status_code != 200:
                raise Exception(f"Wazuh auth failed: {response.status_code}")
            data = response.json()
            self.token = data["data"]["token"]
            self.token_expires = datetime.now(timezone.utc) + timedelta(minutes=12)
            self.connected = True
            return self.token

    async def _api_call(self, method, endpoint, params=None, body=None):
        token = await self._authenticate()
        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=30.0) as http_client:
            response = await http_client.request(
                method=method, url=f"{self.base_url}{endpoint}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                params=params, json=body
            )
            if response.status_code == 401:
                self.token = None
                token = await self._authenticate()
                response = await http_client.request(
                    method=method, url=f"{self.base_url}{endpoint}",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    params=params, json=body
                )
            if response.status_code not in [200, 201]:
                return {"error": response.status_code, "message": response.text}
            return response.json()

    async def sync_agents_to_fleet(self):
        result = await self._api_call("GET", "/agents", params={"limit": 500})
        if "error" in result:
            return {"error": str(result), "synced": 0}
        agents = result.get("data", {}).get("affected_items", [])
        synced = new = updated = 0
        for agent in agents:
            wid = agent.get("id", "000")
            if wid == "000":
                continue
            status_map = {"active": "active", "disconnected": "offline", "never_connected": "offline", "pending": "active"}
            os_info = agent.get("os", {})
            asset_data = {
                "hostname": agent.get("name", f"agent-{wid}"),
                "ip_address": agent.get("ip", "0.0.0.0"),
                "os_type": f"{os_info.get('platform', 'unknown')} {os_info.get('version', '')}".strip(),
                "status": status_map.get(agent.get("status", ""), "offline"),
                "agent_version": agent.get("version", "unknown"),
                "last_seen": agent.get("lastKeepAlive", datetime.now(timezone.utc).isoformat()),
                "tags": agent.get("group", ["default"]),
                "wazuh_agent_id": wid,
            }
            existing = await self.db.assets.find_one({"wazuh_agent_id": wid})
            if existing:
                await self.db.assets.update_one({"wazuh_agent_id": wid}, {"$set": asset_data})
                updated += 1
            else:
                asset_data["asset_id"] = f"asset_{uuid.uuid4().hex[:12]}"
                asset_data["risk_score"] = 0
                asset_data["created_at"] = datetime.now(timezone.utc).isoformat()
                await self.db.assets.insert_one(asset_data)
                new += 1
            synced += 1
        return {"synced": synced, "new": new, "updated": updated}

    async def sync_alerts(self, minutes_back=60):
        since = (datetime.now(timezone.utc) - timedelta(minutes=minutes_back)).strftime("%Y-%m-%dT%H:%M:%S+0000")
        result = await self._api_call("GET", "/alerts", params={"limit": 500, "sort": "-timestamp", "q": f"timestamp>{since}"})
        if "error" in result:
            return {"error": str(result), "synced": 0}
        alerts = result.get("data", {}).get("affected_items", [])
        synced = new_alerts = 0
        for wa in alerts:
            wid = wa.get("id", "")
            if await self.db.alerts.find_one({"wazuh_alert_id": wid}):
                synced += 1
                continue
            rule = wa.get("rule", {})
            level = rule.get("level", 0)
            severity = "critical" if level >= 12 else "high" if level >= 8 else "medium" if level >= 5 else "low"
            mitre = rule.get("mitre", {})
            agent = wa.get("agent", {})
            source_asset = await self.db.assets.find_one({"wazuh_agent_id": agent.get("id", "")})
            alert_data = {
                "alert_id": f"alert_{uuid.uuid4().hex[:12]}",
                "title": rule.get("description", "Wazuh Alert"),
                "description": f"Rule {rule.get('id', 'N/A')} (Level {level})",
                "severity": severity, "category": "intrusion",
                "source_asset_id": source_asset.get("asset_id") if source_asset else None,
                "source_ip": agent.get("ip", ""), "destination_ip": "",
                "status": "open", "is_shadow": False,
                "raw_log": wa.get("full_log", "")[:5000],
                "indicators": mitre.get("id", []) if isinstance(mitre.get("id"), list) else [],
                "mitre_tactics": (mitre.get("tactic", []) if isinstance(mitre.get("tactic"), list) else []) + (mitre.get("id", []) if isinstance(mitre.get("id"), list) else []),
                "assigned_to": None,
                "wazuh_alert_id": wid, "wazuh_rule_id": rule.get("id", ""),
                "wazuh_rule_level": level, "wazuh_agent_id": agent.get("id", ""),
                "created_at": wa.get("timestamp", datetime.now(timezone.utc).isoformat()),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await self.db.alerts.insert_one(alert_data)
            new_alerts += 1
            synced += 1
        return {"synced": synced, "new": new_alerts}

    async def execute_active_response(self, agent_id, command, alert_data=None):
        result = await self._api_call("PUT", f"/active-response/{agent_id}", body={"command": command, "alert": alert_data or {}})
        action_log = {
            "action_id": f"action_{uuid.uuid4().hex[:12]}",
            "type": "active_response", "agent_id": agent_id,
            "command": command, "result": result,
            "executed_at": datetime.now(timezone.utc).isoformat(),
        }
        await self.db.active_response_logs.insert_one(action_log)
        return {"success": "error" not in result, "result": result, "action_id": action_log["action_id"]}

    async def get_server_status(self):
        status = await self._api_call("GET", "/manager/status")
        info = await self._api_call("GET", "/manager/info")
        return {"server_status": status.get("data", {}), "server_info": info.get("data", {})}

    async def get_agent_summary(self):
        result = await self._api_call("GET", "/agents/summary/status")
        return result.get("data", {})


# ==================== DEMO DATA GENERATOR ====================

class DemoDataGenerator:
    """Generates realistic Wazuh-style demo data for pitch presentations."""

    HOSTNAMES = [
        "K7-DC-01", "K7-WEB-PROD", "K7-DB-PRIMARY", "K7-MAIL-01", "K7-DEV-BUILD",
        "K7-FIN-WS01", "K7-FIN-WS02", "K7-HR-PORTAL", "K7-RESEARCH-GPU", "K7-VPN-GW",
        "K7-BACKUP-NAS", "K7-MONITOR-01", "K7-JENKINS-CI", "K7-DOCKER-HOST", "K7-AD-REPLICA",
        "CLIENT-LAPTOP-001", "CLIENT-LAPTOP-002", "CLIENT-DESKTOP-003", "CLIENT-SERVER-DMZ",
        "CLIENT-ERP-NODE1", "CLIENT-ERP-NODE2", "CLIENT-CCTV-NVR", "CLIENT-WIFI-CTRL",
    ]

    OS_TYPES = [
        "Windows Server 2022", "Windows Server 2019", "Windows 11 Pro", "Windows 10 Enterprise",
        "Ubuntu 22.04 LTS", "Ubuntu 24.04 LTS", "CentOS 8", "RHEL 9.2",
        "macOS Sonoma 14.5", "Debian 12",
    ]

    ALERT_TEMPLATES = [
        {"title": "Multiple authentication failures", "desc": "Brute force attempt detected — {count} failed logins in 60 seconds", "severity": "high", "category": "intrusion", "rule_id": "5710", "level": 10, "mitre": ["T1110", "T1110.001"], "groups": ["authentication_failures"]},
        {"title": "Rootkit detection: Hidden process found", "desc": "Hidden process identified by Wazuh rootcheck module", "severity": "critical", "category": "malware", "rule_id": "510", "level": 12, "mitre": ["T1014", "T1564"], "groups": ["rootkit"]},
        {"title": "File integrity change: /etc/passwd modified", "desc": "Unauthorized modification to critical system file", "severity": "critical", "category": "intrusion", "rule_id": "550", "level": 13, "mitre": ["T1098", "T1136"], "groups": ["syscheck"]},
        {"title": "Suspicious PowerShell execution", "desc": "Encoded PowerShell command executed — potential fileless malware", "severity": "high", "category": "malware", "rule_id": "91818", "level": 10, "mitre": ["T1059.001", "T1027"], "groups": ["windows", "powershell"]},
        {"title": "Outbound connection to known C2 server", "desc": "Network connection to threat intelligence blacklisted IP", "severity": "critical", "category": "malware", "rule_id": "87301", "level": 14, "mitre": ["T1071", "T1573"], "groups": ["network"]},
        {"title": "Privilege escalation attempt via sudo", "desc": "User attempted sudo with unauthorized command", "severity": "medium", "category": "intrusion", "rule_id": "5401", "level": 7, "mitre": ["T1548.003"], "groups": ["sudo"]},
        {"title": "Web application SQL injection attempt", "desc": "SQL injection pattern detected in HTTP request parameters", "severity": "high", "category": "intrusion", "rule_id": "31103", "level": 10, "mitre": ["T1190"], "groups": ["web", "attack"]},
        {"title": "Ransomware behavior: Mass file encryption", "desc": "Rapid file extension changes detected — possible ransomware activity", "severity": "critical", "category": "malware", "rule_id": "92001", "level": 15, "mitre": ["T1486"], "groups": ["malware", "ransomware"]},
        {"title": "SSH brute force from external IP", "desc": "Repeated SSH connection attempts from {ip}", "severity": "high", "category": "intrusion", "rule_id": "5712", "level": 10, "mitre": ["T1110.001"], "groups": ["sshd"]},
        {"title": "Lateral movement: PsExec detected", "desc": "PsExec service installation on remote host — lateral movement indicator", "severity": "high", "category": "lateral_movement", "rule_id": "91820", "level": 11, "mitre": ["T1021.002", "T1570"], "groups": ["windows", "lateral"]},
        {"title": "Data exfiltration: Large outbound transfer", "desc": "Unusual data volume transferred to external endpoint", "severity": "high", "category": "data_exfil", "rule_id": "87501", "level": 10, "mitre": ["T1048", "T1041"], "groups": ["network"]},
        {"title": "Vulnerability detected: CVE-2024-3094 (xz backdoor)", "desc": "Critical vulnerability in xz-utils package — remote code execution", "severity": "critical", "category": "malware", "rule_id": "23501", "level": 13, "mitre": ["T1195.002"], "groups": ["vulnerability-detector"]},
        {"title": "PCI-DSS: Firewall configuration change", "desc": "Firewall rules modified — compliance monitoring alert", "severity": "medium", "category": "intrusion", "rule_id": "80701", "level": 7, "mitre": ["T1562.004"], "groups": ["pci_dss"]},
        {"title": "Docker container escape attempt", "desc": "Suspicious syscall from container suggesting escape attempt", "severity": "critical", "category": "intrusion", "rule_id": "87701", "level": 14, "mitre": ["T1611"], "groups": ["docker"]},
        {"title": "New USB device connected", "desc": "Removable storage device plugged into monitored workstation", "severity": "low", "category": "intrusion", "rule_id": "81601", "level": 5, "mitre": ["T1091"], "groups": ["hardware"]},
    ]

    DEPARTMENTS = ["Engineering", "Finance", "HR", "Research", "DevOps", "Security", "Executive", "Marketing", "Sales", "Operations"]

    @staticmethod
    async def seed_demo_data(database):
        """Populate MongoDB with realistic demo data."""
        logger.info("Seeding demo data...")

        # Check if already seeded
        if await database.assets.count_documents({}) > 5:
            logger.info("Demo data already exists, skipping seed")
            return {"status": "already_seeded"}

        now = datetime.now(timezone.utc)
        assets_created = 0
        alerts_created = 0

        # Create demo agents/assets
        for i, hostname in enumerate(DemoDataGenerator.HOSTNAMES):
            ip_third = random.randint(1, 254)
            ip_fourth = random.randint(1, 254)
            status = random.choices(["active", "active", "active", "active", "offline", "siloed"], weights=[4, 4, 4, 4, 1, 0.5])[0]
            risk = random.randint(0, 100) if status != "offline" else 0

            asset = {
                "asset_id": f"asset_{uuid.uuid4().hex[:12]}",
                "hostname": hostname,
                "ip_address": f"10.7.{ip_third}.{ip_fourth}",
                "os_type": random.choice(DemoDataGenerator.OS_TYPES),
                "status": status,
                "agent_version": f"4.{random.choice([7, 8, 9])}.{random.randint(0, 2)}",
                "last_seen": (now - timedelta(minutes=random.randint(0, 120))).isoformat(),
                "risk_score": risk,
                "tags": [random.choice(["production", "development", "staging", "dmz", "internal"])],
                "location": random.choice(["Chennai-DC1", "Chennai-DC2", "AWS-Mumbai", "Azure-Central"]),
                "department": random.choice(DemoDataGenerator.DEPARTMENTS),
                "wazuh_agent_id": f"{i+1:03d}",
                "created_at": (now - timedelta(days=random.randint(30, 365))).isoformat(),
                "user_id": None,
            }
            await database.assets.insert_one(asset)
            assets_created += 1

        # Create demo alerts (last 7 days)
        for _ in range(75):
            template = random.choice(DemoDataGenerator.ALERT_TEMPLATES)
            hours_ago = random.randint(0, 168)  # Last 7 days
            created = now - timedelta(hours=hours_ago)
            random_asset = await database.assets.aggregate([{"$sample": {"size": 1}}]).to_list(1)
            asset = random_asset[0] if random_asset else None

            alert = {
                "alert_id": f"alert_{uuid.uuid4().hex[:12]}",
                "title": template["title"],
                "description": template["desc"].format(count=random.randint(50, 500), ip=f"185.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"),
                "severity": template["severity"],
                "category": template["category"],
                "source_asset_id": asset["asset_id"] if asset else None,
                "source_ip": asset["ip_address"] if asset else f"10.7.{random.randint(1,254)}.{random.randint(1,254)}",
                "destination_ip": f"10.7.{random.randint(1,254)}.{random.randint(1,254)}" if random.random() > 0.3 else "",
                "status": random.choices(["open", "open", "open", "investigating", "resolved", "false_positive"], weights=[3, 3, 3, 2, 1, 0.5])[0],
                "is_shadow": random.random() < 0.1,
                "raw_log": f"wazuh: [{template['rule_id']}] {template['title']} | agent: {asset['hostname'] if asset else 'unknown'} | level: {template['level']}",
                "indicators": template["mitre"],
                "mitre_tactics": template["mitre"],
                "assigned_to": None,
                "wazuh_alert_id": f"wazuh_{uuid.uuid4().hex[:8]}",
                "wazuh_rule_id": template["rule_id"],
                "wazuh_rule_level": template["level"],
                "wazuh_agent_id": asset["wazuh_agent_id"] if asset else "001",
                "created_at": created.isoformat(),
                "updated_at": created.isoformat(),
            }
            await database.alerts.insert_one(alert)
            alerts_created += 1

        # Create demo playbooks
        playbooks = [
            {"name": "Ransomware Response", "desc": "Auto-isolate endpoint + block C2 + snapshot evidence", "triggers": ["ransomware", "mass_encryption"], "commands": ["firewall-drop", "disable-account"], "active": True},
            {"name": "Brute Force Mitigation", "desc": "Block source IP after 10 failed attempts", "triggers": ["authentication_failures > 10"], "commands": ["firewall-drop", "host-deny"], "active": True},
            {"name": "Lateral Movement Containment", "desc": "Isolate source + alert SOC + scan connected assets", "triggers": ["lateral_movement", "psexec"], "commands": ["firewall-drop"], "active": True},
            {"name": "Phishing Response", "desc": "Quarantine email + scan attachment + notify user", "triggers": ["phishing", "suspicious_attachment"], "commands": [], "active": True},
            {"name": "Compliance Drift Alert", "desc": "Notify security team on PCI-DSS rule violation", "triggers": ["pci_dss", "firewall_change"], "commands": [], "active": True},
        ]
        for pb in playbooks:
            await database.playbooks.insert_one({
                "playbook_id": f"pb_{uuid.uuid4().hex[:12]}",
                "name": pb["name"], "description": pb["desc"],
                "trigger_conditions": pb["triggers"],
                "actions": [{"type": "wazuh_active_response", "command": c} for c in pb["commands"]],
                "is_active": pb["active"], "execution_count": random.randint(0, 50),
                "wazuh_commands": pb["commands"],
                "created_by": "system",
                "created_at": (now - timedelta(days=random.randint(7, 90))).isoformat(),
                "updated_at": now.isoformat(),
            })

        # Create demo scan results
        scan_files = [
            {"name": "suspicious_update.exe", "verdict": "malicious", "confidence": 0.87, "severity": "critical", "threat": "Trojan.GenericKD", "family": "GenericKD"},
            {"name": "quarterly_report.docx", "verdict": "clean", "confidence": 0.05, "severity": "low", "threat": None, "family": None},
            {"name": "setup_installer.msi", "verdict": "suspicious", "confidence": 0.52, "severity": "medium", "threat": "PUA.Installer", "family": "PUA"},
            {"name": "employee_data.xlsx", "verdict": "clean", "confidence": 0.03, "severity": "low", "threat": None, "family": None},
            {"name": "network_tool.exe", "verdict": "suspicious", "confidence": 0.61, "severity": "high", "threat": "HackTool.Mimikatz", "family": "HackTool"},
            {"name": "chrome_update.exe", "verdict": "malicious", "confidence": 0.93, "severity": "critical", "threat": "Backdoor.Cobalt", "family": "CobaltStrike"},
            {"name": "firmware_v2.bin", "verdict": "clean", "confidence": 0.08, "severity": "low", "threat": None, "family": None},
        ]
        for sf in scan_files:
            sha256 = hashlib.sha256(sf["name"].encode()).hexdigest()
            md5 = hashlib.md5(sf["name"].encode()).hexdigest()
            scan = {
                "scan_id": f"scan_{uuid.uuid4().hex[:12]}",
                "filename": sf["name"], "file_size": random.randint(10000, 5000000),
                "file_hash_sha256": sha256, "file_hash_md5": md5,
                "file_type": "PE/EXE" if sf["name"].endswith(".exe") else "Document",
                "status": "completed", "submitted_by": "demo",
                "pass1_hash_lookup": {"pass": 1, "name": "Rapid Triage", "matched": sf["verdict"] == "malicious", "confidence_contribution": 0.95 if sf["verdict"] == "malicious" else 0.0},
                "pass2_static_analysis": {"pass": 2, "name": "Static Feature Extraction", "is_pe": sf["name"].endswith(".exe"), "suspicious_indicators": ["Packed section: .upx0"] if sf["verdict"] != "clean" else [], "confidence_contribution": 0.5 if sf["verdict"] != "clean" else 0.05},
                "pass3_entropy_analysis": {"pass": 3, "name": "Entropy Analysis", "overall_entropy": round(random.uniform(5.0, 7.8), 4), "is_likely_packed": sf["verdict"] == "malicious", "confidence_contribution": 0.4 if sf["verdict"] == "malicious" else 0.05},
                "pass4_yara_matches": [{"rule": "SuspiciousStrings", "meta": {"severity": "high"}}] if sf["verdict"] != "clean" else [],
                "pass5_ai_analysis": {"pass": 5, "name": "AI Semantic Reasoning", "analysis": f"AI analysis of {sf['name']}", "confidence_contribution": sf["confidence"]},
                "cca_vector": {"signature_match": sf["confidence"] * 0.9, "structural_anomaly": sf["confidence"] * 0.7, "entropy_deviation": sf["confidence"] * 0.5, "rule_match_strength": sf["confidence"] * 0.8, "semantic_coherence": sf["confidence"] * 0.6},
                "verdict": sf["verdict"], "confidence_score": sf["confidence"],
                "severity": sf["severity"], "threat_name": sf["threat"], "threat_family": sf["family"],
                "mitre_techniques": ["T1055", "T1027"] if sf["verdict"] == "malicious" else [],
                "created_at": (now - timedelta(hours=random.randint(1, 72))).isoformat(),
                "completed_at": (now - timedelta(hours=random.randint(0, 71))).isoformat(),
            }
            await database.scans.insert_one(scan)

        logger.info(f"Demo data seeded: {assets_created} assets, {alerts_created} alerts")
        return {"assets": assets_created, "alerts": alerts_created, "playbooks": len(playbooks), "scans": len(scan_files)}


# Initialize Wazuh bridge
wazuh_bridge = WazuhBridge(db)


# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> UserBase:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    if not session_token:
        # In demo mode, return a default user
        if DEMO_MODE:
            return UserBase(user_id="demo_user", email="demo@k7aegis.com", name="K7 SOC Analyst", role="admin")
        raise HTTPException(status_code=401, detail="Not authenticated")
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        if DEMO_MODE:
            return UserBase(user_id="demo_user", email="demo@k7aegis.com", name="K7 SOC Analyst", role="admin")
        raise HTTPException(status_code=401, detail="Invalid session")
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return UserBase(**user_doc)


# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/demo-login")
async def demo_login(response: Response):
    """Demo login — no external auth needed for pitch/demo"""
    user_id = "demo_user"
    user_doc = await db.users.find_one({"user_id": user_id})
    if not user_doc:
        user_doc = {
            "user_id": user_id, "email": "soc-analyst@k7aegis.com",
            "name": "K7 SOC Analyst", "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)

    session_token = str(uuid.uuid4())
    session = {
        "session_id": str(uuid.uuid4()), "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session)

    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=False, samesite="lax", path="/", max_age=7*24*60*60)
    return {"user": {k: v for k, v in user_doc.items() if k != "_id"}, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: UserBase = Depends(get_current_user)):
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}


# ==================== ASSETS / FLEET COMMAND ====================

@api_router.get("/assets")
async def get_assets(user: UserBase = Depends(get_current_user)):
    assets = await db.assets.find({}, {"_id": 0}).to_list(1000)
    return assets

@api_router.post("/assets")
async def create_asset(asset_data: AssetCreate, user: UserBase = Depends(get_current_user)):
    asset = Asset(**asset_data.model_dump())
    doc = asset.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_seen'] = doc['last_seen'].isoformat()
    await db.assets.insert_one(doc)
    return doc

@api_router.get("/assets/{asset_id}")
async def get_asset(asset_id: str, user: UserBase = Depends(get_current_user)):
    asset = await db.assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@api_router.post("/assets/{asset_id}/silo")
async def silo_asset(asset_id: str, data: ShadowSessionCreate, user: UserBase = Depends(get_current_user)):
    asset = await db.assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await db.assets.update_one({"asset_id": asset_id}, {"$set": {"status": "siloed"}})
    # If connected to Wazuh, also isolate via active response
    if asset.get("wazuh_agent_id") and not DEMO_MODE:
        await wazuh_bridge.execute_active_response(asset["wazuh_agent_id"], "firewall-drop")
    shadow = ShadowSession(asset_id=asset_id, alert_id=data.alert_id, reason=data.reason)
    doc = shadow.model_dump()
    doc['started_at'] = doc['started_at'].isoformat()
    await db.shadow_sessions.insert_one(doc)
    return {"message": "Asset siloed", "shadow_session": doc}

@api_router.post("/assets/{asset_id}/unsilo")
async def unsilo_asset(asset_id: str, user: UserBase = Depends(get_current_user)):
    await db.assets.update_one({"asset_id": asset_id}, {"$set": {"status": "active"}})
    await db.shadow_sessions.update_one({"asset_id": asset_id, "status": "active"}, {"$set": {"status": "terminated", "ended_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Asset unsiloed"}


# ==================== ALERTS / CONVERGENCE DASHBOARD ====================

@api_router.get("/alerts")
async def get_alerts(status: Optional[str] = None, severity: Optional[str] = None, user: UserBase = Depends(get_current_user)):
    query = {}
    if status: query["status"] = status
    if severity: query["severity"] = severity
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return alerts

@api_router.post("/alerts")
async def create_alert(alert_data: AlertCreate, user: UserBase = Depends(get_current_user)):
    alert = Alert(**alert_data.model_dump())
    doc = alert.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.alerts.insert_one(doc)
    return doc

@api_router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str, user: UserBase = Depends(get_current_user)):
    alert = await db.alerts.find_one({"alert_id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@api_router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, request: Request, user: UserBase = Depends(get_current_user)):
    body = await request.json()
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.alerts.update_one({"alert_id": alert_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return await get_alert(alert_id, user)


# ==================== SHADOW SESSIONS ====================

@api_router.get("/shadow-sessions")
async def get_shadow_sessions(user: UserBase = Depends(get_current_user)):
    return await db.shadow_sessions.find({}, {"_id": 0}).sort("started_at", -1).to_list(100)


# ==================== PLAYBOOKS / SOAR ====================

@api_router.get("/playbooks")
async def get_playbooks(user: UserBase = Depends(get_current_user)):
    return await db.playbooks.find({}, {"_id": 0}).to_list(100)

@api_router.post("/playbooks")
async def create_playbook(data: PlaybookCreate, user: UserBase = Depends(get_current_user)):
    pb = Playbook(**data.model_dump())
    pb.created_by = user.user_id
    doc = pb.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.playbooks.insert_one(doc)
    return doc

@api_router.post("/playbooks/{playbook_id}/execute")
async def execute_playbook(playbook_id: str, request: Request, user: UserBase = Depends(get_current_user)):
    """Execute a playbook — triggers Wazuh active response commands"""
    pb = await db.playbooks.find_one({"playbook_id": playbook_id}, {"_id": 0})
    if not pb:
        raise HTTPException(status_code=404, detail="Playbook not found")

    body = await request.json()
    target_agent_id = body.get("agent_id", "")
    results = []

    for action in pb.get("actions", []):
        if action.get("type") == "wazuh_active_response" and target_agent_id:
            if DEMO_MODE:
                results.append({"command": action.get("command"), "status": "simulated", "agent_id": target_agent_id})
            else:
                r = await wazuh_bridge.execute_active_response(target_agent_id, action.get("command", ""))
                results.append(r)

    await db.playbooks.update_one({"playbook_id": playbook_id}, {"$inc": {"execution_count": 1}})
    return {"playbook_id": playbook_id, "executed": True, "results": results}


# ==================== SCAN ENGINE ====================

class AegisScanEngine:
    KNOWN_MALICIOUS_HASHES = {
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": {"name": "Empty file", "family": "test"},
    }

    @staticmethod
    def compute_hashes(file_bytes):
        return {"sha256": hashlib.sha256(file_bytes).hexdigest(), "md5": hashlib.md5(file_bytes).hexdigest()}

    @staticmethod
    def pass1_hash_lookup(sha256, md5):
        start = time.time()
        result = {"pass": 1, "name": "Rapid Triage", "matched": False, "source": None, "threat_info": None, "confidence_contribution": 0.0}
        if sha256 in AegisScanEngine.KNOWN_MALICIOUS_HASHES:
            result.update({"matched": True, "source": "K7_signature_db", "threat_info": AegisScanEngine.KNOWN_MALICIOUS_HASHES[sha256], "confidence_contribution": 0.95})
        result["duration_ms"] = round((time.time() - start) * 1000, 2)
        return result

    @staticmethod
    def pass2_static_analysis(file_bytes):
        start = time.time()
        result = {"pass": 2, "name": "Static Feature Extraction", "is_pe": False, "pe_info": {}, "suspicious_indicators": [], "confidence_contribution": 0.0}
        if len(file_bytes) >= 2 and file_bytes[:2] == b'MZ':
            result["is_pe"] = True
            try:
                pe_offset = struct.unpack_from('<I', file_bytes, 0x3C)[0]
                if pe_offset + 24 < len(file_bytes):
                    coff = pe_offset + 4
                    machine = struct.unpack_from('<H', file_bytes, coff)[0]
                    num_sec = struct.unpack_from('<H', file_bytes, coff + 2)[0]
                    result["pe_info"] = {"machine": {0x14c: "x86", 0x8664: "x64"}.get(machine, "unknown"), "num_sections": num_sec}
            except:
                pass
            result["confidence_contribution"] = 0.25 if result["suspicious_indicators"] else 0.05
        result["duration_ms"] = round((time.time() - start) * 1000, 2)
        return result

    @staticmethod
    def pass3_entropy_analysis(file_bytes):
        start = time.time()
        def calc_entropy(data):
            if not data: return 0.0
            freq = Counter(data)
            length = len(data)
            return round(-sum((c/length) * math.log2(c/length) for c in freq.values() if c > 0), 4)
        entropy = calc_entropy(file_bytes)
        packed = entropy > 7.0
        result = {"pass": 3, "name": "Entropy Analysis", "overall_entropy": entropy, "high_entropy_regions": 0, "is_likely_packed": packed, "is_likely_encrypted": entropy > 7.5, "confidence_contribution": 0.6 if entropy > 7.5 else 0.4 if packed else 0.05}
        result["duration_ms"] = round((time.time() - start) * 1000, 2)
        return result

    @staticmethod
    def pass4_yara_scan(file_bytes):
        start = time.time()
        result = {"pass": 4, "name": "YARA Rule Matching", "matches": [], "rules_checked": 0, "confidence_contribution": 0.0}
        try:
            import yara
            rules_src = '''
rule SuspiciousPacker { meta: description = "Packer signatures" severity = "medium" strings: $upx = "UPX!" ascii $vmp = ".vmp0" ascii condition: any of them }
rule SuspiciousStrings { meta: description = "Suspicious strings" severity = "high" strings: $cmd = "cmd.exe /c" ascii nocase $ps = "powershell" ascii nocase condition: uint16(0) == 0x5A4D and any of them }
'''
            rules = yara.compile(source=rules_src)
            matches = rules.match(data=file_bytes)
            result["rules_checked"] = 2
            for m in matches:
                result["matches"].append({"rule": m.rule, "meta": m.meta, "strings_matched": len(m.strings)})
            if result["matches"]:
                result["confidence_contribution"] = 0.7
        except ImportError:
            result["error"] = "yara-python not installed"
        result["duration_ms"] = round((time.time() - start) * 1000, 2)
        return result

    @staticmethod
    async def pass5_ai_analysis(file_info, pass_results, api_key):
        start = time.time()
        result = {"pass": 5, "name": "AI Semantic Reasoning", "analysis": "", "threat_classification": "", "mitre_techniques": [], "recommended_actions": [], "confidence_contribution": 0.0}
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            prompt = f"""Cybersecurity threat analyst. Analyze scan results for {file_info.get('filename')}. SHA-256: {file_info.get('sha256')}. Pass results: {json.dumps(pass_results, default=str)[:3000]}. Respond in JSON: {{"verdict":"clean|suspicious|malicious","confidence":0.0-1.0,"severity":"critical|high|medium|low","threat_name":"name or null","mitre_techniques":["T1xxx"],"analysis_summary":"brief","recommended_actions":["action1"]}}"""
            response = model.generate_content(prompt)
            text = response.text.strip().replace("```json", "").replace("```", "").strip()
            ai = json.loads(text)
            result.update({"analysis": ai.get("analysis_summary", ""), "threat_classification": ai.get("threat_name", ""), "mitre_techniques": ai.get("mitre_techniques", []), "recommended_actions": ai.get("recommended_actions", []), "ai_verdict": ai.get("verdict"), "confidence_contribution": float(ai.get("confidence", 0.0))})
        except Exception as e:
            result["error"] = str(e)
        result["duration_ms"] = round((time.time() - start) * 1000, 2)
        return result

    @staticmethod
    def compute_cca_vector(pass_results):
        weights = {"signature_match": 0.30, "structural_anomaly": 0.20, "entropy_deviation": 0.15, "rule_match_strength": 0.20, "semantic_coherence": 0.15}
        vector = {
            "signature_match": pass_results.get("pass1", {}).get("confidence_contribution", 0.0),
            "structural_anomaly": pass_results.get("pass2", {}).get("confidence_contribution", 0.0),
            "entropy_deviation": pass_results.get("pass3", {}).get("confidence_contribution", 0.0),
            "rule_match_strength": pass_results.get("pass4", {}).get("confidence_contribution", 0.0),
            "semantic_coherence": pass_results.get("pass5", {}).get("confidence_contribution", 0.0),
        }
        score = sum(vector[k] * weights[k] for k in weights)
        mx = max(vector.values()) if vector.values() else 0
        if mx > 0.85: score = min(1.0, score * 1.3)
        verdict = "malicious" if score >= 0.70 else "suspicious" if score >= 0.40 else "suspicious" if score >= 0.15 else "clean"
        severity = "critical" if score >= 0.85 else "high" if score >= 0.70 else "medium" if score >= 0.40 else "low"
        return {"vector": vector, "weights": weights, "weighted_score": round(score, 4), "verdict": verdict, "severity": severity, "confidence_score": round(score, 4)}


@api_router.post("/scan/submit")
async def submit_scan(request: Request, user: UserBase = Depends(get_current_user)):
    body = await request.json()
    filename = body.get("filename", "unknown")
    b64 = body.get("file_content_base64")
    depth = body.get("scan_depth", "full")
    if not b64:
        raise HTTPException(status_code=400, detail="file_content_base64 required")
    try:
        file_bytes = base64.b64decode(b64)
    except:
        raise HTTPException(status_code=400, detail="Invalid base64")

    hashes = AegisScanEngine.compute_hashes(file_bytes)
    file_type = "PE/EXE" if file_bytes[:2] == b'MZ' else "ELF" if file_bytes[:4] == b'\x7fELF' else "PDF" if file_bytes[:4] == b'%PDF' else "unknown"

    pr = {}
    pr["pass1"] = AegisScanEngine.pass1_hash_lookup(hashes["sha256"], hashes["md5"])
    pr["pass2"] = AegisScanEngine.pass2_static_analysis(file_bytes)
    if depth in ["standard", "full"]:
        pr["pass3"] = AegisScanEngine.pass3_entropy_analysis(file_bytes)
        pr["pass4"] = AegisScanEngine.pass4_yara_scan(file_bytes)
    if depth == "full":
        gkey = os.environ.get('GEMINI_API_KEY', '')
        if gkey:
            pr["pass5"] = await AegisScanEngine.pass5_ai_analysis({"filename": filename, "sha256": hashes["sha256"], "file_type": file_type, "file_size": len(file_bytes)}, pr, gkey)

    cca = AegisScanEngine.compute_cca_vector(pr)
    scan_doc = {
        "scan_id": f"scan_{uuid.uuid4().hex[:12]}", "filename": filename,
        "file_size": len(file_bytes), "file_hash_sha256": hashes["sha256"], "file_hash_md5": hashes["md5"],
        "file_type": file_type, "status": "completed", "submitted_by": user.user_id,
        "pass1_hash_lookup": pr.get("pass1"), "pass2_static_analysis": pr.get("pass2"),
        "pass3_entropy_analysis": pr.get("pass3"), "pass4_yara_matches": pr.get("pass4", {}).get("matches", []),
        "pass5_ai_analysis": pr.get("pass5"),
        "cca_vector": cca["vector"], "verdict": cca["verdict"], "confidence_score": cca["confidence_score"],
        "severity": cca["severity"],
        "threat_name": pr.get("pass5", {}).get("threat_classification"),
        "mitre_techniques": pr.get("pass5", {}).get("mitre_techniques", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }

    # Auto-create alert if threat found
    if cca["verdict"] in ["malicious", "suspicious"] and cca["confidence_score"] >= 0.4:
        alert_doc = {
            "alert_id": f"alert_{uuid.uuid4().hex[:12]}",
            "title": f"Scan: {scan_doc.get('threat_name') or cca['verdict'].upper()} — {filename}",
            "description": f"Aegis detected {cca['verdict']} file. Confidence: {cca['confidence_score']*100:.1f}%",
            "severity": cca["severity"], "category": "malware",
            "source_ip": "", "status": "open", "is_shadow": False,
            "indicators": [hashes["sha256"]], "mitre_tactics": scan_doc.get("mitre_techniques", []),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.alerts.insert_one(alert_doc)
        scan_doc["alert_id"] = alert_doc["alert_id"]

    await db.scans.insert_one(scan_doc)
    return {k: v for k, v in scan_doc.items() if k != "_id"}

@api_router.get("/scan/results")
async def get_scan_results(limit: int = 50, user: UserBase = Depends(get_current_user)):
    return await db.scans.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)

@api_router.get("/scan/results/{scan_id}")
async def get_scan_result(scan_id: str, user: UserBase = Depends(get_current_user)):
    r = await db.scans.find_one({"scan_id": scan_id}, {"_id": 0})
    if not r: raise HTTPException(status_code=404, detail="Scan not found")
    return r

@api_router.get("/scan/stats")
async def get_scan_stats(user: UserBase = Depends(get_current_user)):
    total = await db.scans.count_documents({})
    mal = await db.scans.count_documents({"verdict": "malicious"})
    sus = await db.scans.count_documents({"verdict": "suspicious"})
    clean = await db.scans.count_documents({"verdict": "clean"})
    return {"total_scans": total, "malicious": mal, "suspicious": sus, "clean": clean, "detection_rate": round((mal+sus)/total*100, 1) if total else 0, "avg_threat_confidence": 0.65}


# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: UserBase = Depends(get_current_user)):
    return {
        "assets": {
            "total": await db.assets.count_documents({}),
            "active": await db.assets.count_documents({"status": "active"}),
            "siloed": await db.assets.count_documents({"status": "siloed"}),
            "offline": await db.assets.count_documents({"status": "offline"}),
        },
        "alerts": {
            "total": await db.alerts.count_documents({}),
            "critical": await db.alerts.count_documents({"severity": "critical", "status": "open"}),
            "high": await db.alerts.count_documents({"severity": "high", "status": "open"}),
            "medium": await db.alerts.count_documents({"severity": "medium", "status": "open"}),
            "low": await db.alerts.count_documents({"severity": "low", "status": "open"}),
        },
        "shadow_containment": {
            "active_sessions": await db.shadow_sessions.count_documents({"status": "active"}),
        },
        "playbooks": {
            "total": await db.playbooks.count_documents({}),
            "active": await db.playbooks.count_documents({"is_active": True}),
        },
        "scans": {
            "total": await db.scans.count_documents({}),
            "malicious": await db.scans.count_documents({"verdict": "malicious"}),
        },
        "wazuh": {
            "connected": wazuh_bridge.connected or DEMO_MODE,
            "demo_mode": DEMO_MODE,
        }
    }

@api_router.get("/dashboard/alert-timeline")
async def get_alert_timeline(user: UserBase = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    timeline = []
    for i in range(24):
        h_start = now - timedelta(hours=24-i)
        h_end = now - timedelta(hours=23-i)
        count = await db.alerts.count_documents({"created_at": {"$gte": h_start.isoformat(), "$lt": h_end.isoformat()}})
        timeline.append({"hour": h_start.strftime("%H:00"), "count": count})
    return timeline


# ==================== WAZUH INTEGRATION ENDPOINTS ====================

@api_router.get("/wazuh/status")
async def get_wazuh_status(user: UserBase = Depends(get_current_user)):
    if DEMO_MODE:
        agent_count = await db.assets.count_documents({})
        return {
            "status": "connected", "mode": "demo",
            "server": {"version": "4.9.0", "hostname": "k7-wazuh-manager", "cluster": "enabled"},
            "agents": {"total": agent_count, "active": agent_count - 2, "disconnected": 2, "never_connected": 0},
        }
    try:
        status = await wazuh_bridge.get_server_status()
        agents = await wazuh_bridge.get_agent_summary()
        return {"status": "connected", "mode": "live", "server": status, "agents": agents}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

@api_router.post("/wazuh/sync/agents")
async def trigger_agent_sync(user: UserBase = Depends(get_current_user)):
    if DEMO_MODE:
        return {"synced": await db.assets.count_documents({}), "new": 0, "updated": 0, "mode": "demo"}
    return await wazuh_bridge.sync_agents_to_fleet()

@api_router.post("/wazuh/sync/alerts")
async def trigger_alert_sync(user: UserBase = Depends(get_current_user)):
    if DEMO_MODE:
        return {"synced": await db.alerts.count_documents({}), "new": 0, "mode": "demo"}
    return await wazuh_bridge.sync_alerts(minutes_back=60)

@api_router.post("/wazuh/active-response/{agent_id}")
async def trigger_active_response(agent_id: str, request: Request, user: UserBase = Depends(get_current_user)):
    body = await request.json()
    command = body.get("command", "")
    if DEMO_MODE:
        return {"success": True, "mode": "demo", "command": command, "agent_id": agent_id, "action_id": f"action_{uuid.uuid4().hex[:12]}"}
    return await wazuh_bridge.execute_active_response(agent_id, command)

@api_router.post("/wazuh/isolate/{agent_id}")
async def isolate_via_wazuh(agent_id: str, user: UserBase = Depends(get_current_user)):
    await db.assets.update_one({"wazuh_agent_id": agent_id}, {"$set": {"status": "siloed"}})
    if DEMO_MODE:
        return {"success": True, "mode": "demo", "agent_id": agent_id}
    return await wazuh_bridge.execute_active_response(agent_id, "firewall-drop")


# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"name": "K7 AegisXDR", "version": "2.0.0", "wazuh_integrated": True, "demo_mode": DEMO_MODE}

# ==================== WAZUH WEBHOOK RECEIVER ====================
# Real-time alert ingestion from Wazuh custom integration framework

try:
    from webhook_receiver import register_webhook_endpoints
    register_webhook_endpoints(api_router, db)
    logger.info("Wazuh webhook receiver endpoints registered")
except ImportError:
    logger.warning("webhook_receiver.py not found — webhook endpoints not available")


# Mount router
app.include_router(api_router)

# CORS
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Startup: seed demo data
@app.on_event("startup")
async def startup():
    if DEMO_MODE:
        await DemoDataGenerator.seed_demo_data(db)
        logger.info("AegisXDR started in DEMO MODE with Wazuh integration layer")
    else:
        if os.environ.get("WAZUH_API_URL"):
            try:
                await wazuh_bridge._authenticate()
                logger.info("Connected to Wazuh server")
            except Exception as e:
                logger.warning(f"Wazuh connection failed: {e}. Running without live Wazuh data.")

@app.on_event("shutdown")
async def shutdown():
    client.close()