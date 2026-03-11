K7 AegisXDR — Wazuh Webhook Receiver
======================================
These endpoints receive real-time alert data from Wazuh's custom integration.
When Wazuh detects a high-severity event, it sends JSON to these webhooks.
AegisXDR then enriches the alert with AI analysis and creates dashboard entries.

ADD TO server.py:
  from webhook_receiver import register_webhook_endpoints
  register_webhook_endpoints(api_router, db)
"""

from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone
import uuid
import logging
import os
import json

logger = logging.getLogger(__name__)


def register_webhook_endpoints(router: APIRouter, db):
    """Register Wazuh webhook endpoints on the existing FastAPI router."""

    @router.post("/wazuh/webhook")
    async def wazuh_webhook(request: Request):
        """
        Receive alert from Wazuh custom integration (level 8+).
        Wazuh sends JSON payload containing the alert data.

        Wazuh integration config triggers this when rule level >= 8.
        """
        try:
            payload = await request.json()
        except Exception:
            body = await request.body()
            try:
                payload = json.loads(body)
            except Exception:
                logger.error(f"Webhook: invalid payload")
                raise HTTPException(status_code=400, detail="Invalid JSON payload")

        # Wazuh webhook payload structure
        rule = payload.get("rule", {})
        agent = payload.get("agent", {})
        data = payload.get("data", {})
        location = payload.get("location", "")
        full_log = payload.get("full_log", "")

        level = rule.get("level", 0)
        severity = "critical" if level >= 12 else "high" if level >= 8 else "medium" if level >= 5 else "low"

        # MITRE ATT&CK extraction
        mitre = rule.get("mitre", {})
        mitre_tactics = mitre.get("tactic", []) if isinstance(mitre.get("tactic"), list) else []
        mitre_ids = mitre.get("id", []) if isinstance(mitre.get("id"), list) else []

        # Map to category
        groups = rule.get("groups", [])
        category = "intrusion"
        for g in groups:
            gl = g.lower()
            if gl in ("malware", "rootkit", "virus", "ransomware", "aegis_scan"):
                category = "malware"
                break
            elif "exfil" in gl:
                category = "data_exfil"
                break
            elif "lateral" in gl:
                category = "lateral_movement"
                break
            elif "phishing" in gl:
                category = "phishing"
                break

        # Find associated asset
        agent_id = agent.get("id", "")
        source_asset = await db.assets.find_one({"wazuh_agent_id": agent_id})

        # Create AegisXDR alert
        alert_id = f"alert_{uuid.uuid4().hex[:12]}"
        alert_doc = {
            "alert_id": alert_id,
            "title": rule.get("description", "Wazuh Webhook Alert"),
            "description": f"Rule {rule.get('id', 'N/A')} (Level {level}): {rule.get('description', '')}",
            "severity": severity,
            "category": category,
            "source_asset_id": source_asset.get("asset_id") if source_asset else None,
            "source_ip": agent.get("ip", data.get("srcip", "")),
            "destination_ip": data.get("dstip", ""),
            "status": "open",
            "is_shadow": False,
            "raw_log": full_log[:5000] if full_log else json.dumps(payload)[:5000],
            "indicators": mitre_ids,
            "mitre_tactics": mitre_tactics + mitre_ids,
            "assigned_to": None,
            "wazuh_alert_id": f"webhook_{uuid.uuid4().hex[:8]}",
            "wazuh_rule_id": str(rule.get("id", "")),
            "wazuh_rule_level": level,
            "wazuh_agent_id": agent_id,
            "wazuh_groups": groups,
            "webhook_source": "wazuh_integration",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        await db.alerts.insert_one(alert_doc)
        logger.info(f"Webhook alert created: {alert_id} — {rule.get('description', 'N/A')} (Level {level})")

        # If critical (level 12+), auto-trigger AI analysis
        if level >= 12:
            ai_task = {
                "task_id": f"ai_{uuid.uuid4().hex[:12]}",
                "alert_id": alert_id,
                "type": "auto_triage",
                "status": "queued",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.ai_analysis_queue.insert_one(ai_task)
            logger.info(f"Auto-queued AI triage for critical alert: {alert_id}")

        # If it matches a K7 scan engine rule, trigger re-scan
        if "aegis_scan" in groups:
            scan_task = {
                "task_id": f"rescan_{uuid.uuid4().hex[:12]}",
                "alert_id": alert_id,
                "type": "rescan",
                "file_hash": data.get("sha256", ""),
                "status": "queued",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.scan_queue.insert_one(scan_task)

        return {
            "status": "accepted",
            "alert_id": alert_id,
            "severity": severity,
            "auto_triage": level >= 12,
        }

    @router.post("/wazuh/webhook/critical")
    async def wazuh_webhook_critical(request: Request):
        """
        Receive critical alerts (level 12+) from Wazuh.
        Same processing as standard webhook, but also:
        1. Auto-triggers SOAR playbook matching
        2. Escalates to notification queue
        """
        try:
            payload = await request.json()
        except Exception:
            body = await request.body()
            payload = json.loads(body)

        rule = payload.get("rule", {})
        agent = payload.get("agent", {})
        level = rule.get("level", 0)
        groups = rule.get("groups", [])

        # Create alert via standard webhook
        # (duplicate the core logic for self-containment)
        alert_id = f"alert_{uuid.uuid4().hex[:12]}"
        mitre = rule.get("mitre", {})

        source_asset = await db.assets.find_one({"wazuh_agent_id": agent.get("id", "")})

        alert_doc = {
            "alert_id": alert_id,
            "title": f"⚠ CRITICAL: {rule.get('description', 'Critical Alert')}",
            "description": f"Rule {rule.get('id', 'N/A')} (Level {level}) — CRITICAL AUTO-ESCALATION",
            "severity": "critical",
            "category": "malware" if any(g in str(groups).lower() for g in ["malware", "rootkit", "ransomware"]) else "intrusion",
            "source_asset_id": source_asset.get("asset_id") if source_asset else None,
            "source_ip": agent.get("ip", ""),
            "status": "open",
            "is_shadow": False,
            "raw_log": payload.get("full_log", json.dumps(payload))[:5000],
            "indicators": mitre.get("id", []) if isinstance(mitre.get("id"), list) else [],
            "mitre_tactics": (mitre.get("tactic", []) if isinstance(mitre.get("tactic"), list) else []) +
                             (mitre.get("id", []) if isinstance(mitre.get("id"), list) else []),
            "wazuh_alert_id": f"critical_{uuid.uuid4().hex[:8]}",
            "wazuh_rule_id": str(rule.get("id", "")),
            "wazuh_rule_level": level,
            "wazuh_agent_id": agent.get("id", ""),
            "wazuh_groups": groups,
            "webhook_source": "wazuh_critical",
            "auto_escalated": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.alerts.insert_one(alert_doc)

        # Auto-match SOAR playbook
        matched_playbooks = []
        playbooks = await db.playbooks.find({"is_active": True}).to_list(100)
        for pb in playbooks:
            triggers = pb.get("trigger_conditions", [])
            for trigger in triggers:
                if trigger.lower() in str(groups).lower() or trigger.lower() in str(rule.get("description", "")).lower():
                    matched_playbooks.append({
                        "playbook_id": pb["playbook_id"],
                        "name": pb["name"],
                        "matched_trigger": trigger,
                    })
                    break

        # Log escalation
        escalation = {
            "escalation_id": f"esc_{uuid.uuid4().hex[:12]}",
            "alert_id": alert_id,
            "rule_level": level,
            "matched_playbooks": matched_playbooks,
            "agent_id": agent.get("id", ""),
            "auto_response_triggered": len(matched_playbooks) > 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.escalations.insert_one(escalation)

        logger.warning(f"CRITICAL webhook: {alert_id} — Level {level} — {len(matched_playbooks)} playbooks matched")

        return {
            "status": "critical_accepted",
            "alert_id": alert_id,
            "matched_playbooks": matched_playbooks,
            "auto_response": len(matched_playbooks) > 0,
        }

    @router.get("/wazuh/webhook/health")
    async def webhook_health():
        """Health check for Wazuh webhook receiver"""
        return {
            "status": "healthy",
            "receiver": "aegisxdr_wazuh_webhook",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }