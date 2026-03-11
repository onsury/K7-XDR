from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_playbooks():
    return {
        "total": 8,
        "playbooks": [
            {
                "id": "PB-001", "name": "Ransomware Response", "severity": "critical", "enabled": True, "triggerRule": "R-001",
                "steps": [
                    {"order": 1, "action": "Isolate endpoint from network", "automated": True, "timeout": 30},
                    {"order": 2, "action": "Kill malicious processes", "automated": True, "timeout": 60},
                    {"order": 3, "action": "Block C2 IPs at firewall", "automated": True, "timeout": 30},
                    {"order": 4, "action": "Capture forensic image", "automated": False, "timeout": 3600},
                    {"order": 5, "action": "Notify CERT-In within 6 hours", "automated": True, "timeout": 21600},
                    {"order": 6, "action": "Escalate to CISO", "automated": True, "timeout": 300},
                ],
                "lastTriggered": "2026-02-24T12:30:00+05:30", "triggerCount": 3
            },
            {
                "id": "PB-002", "name": "Data Exfiltration Response", "severity": "critical", "enabled": True, "triggerRule": "R-010",
                "steps": [
                    {"order": 1, "action": "Block outbound connection", "automated": True, "timeout": 15},
                    {"order": 2, "action": "Isolate source endpoint", "automated": True, "timeout": 30},
                    {"order": 3, "action": "Assess data classification", "automated": False, "timeout": 7200},
                    {"order": 4, "action": "DPDPA breach assessment", "automated": False, "timeout": 86400},
                    {"order": 5, "action": "Notify DPO", "automated": True, "timeout": 600},
                ],
                "lastTriggered": "2026-02-24T09:00:00+05:30", "triggerCount": 1
            },
            {
                "id": "PB-003", "name": "Credential Theft Response", "severity": "high", "enabled": True, "triggerRule": "R-002",
                "steps": [
                    {"order": 1, "action": "Force password reset", "automated": True, "timeout": 60},
                    {"order": 2, "action": "Revoke active sessions", "automated": True, "timeout": 30},
                    {"order": 3, "action": "Isolate source endpoint", "automated": True, "timeout": 30},
                    {"order": 4, "action": "Scan for lateral movement", "automated": True, "timeout": 300},
                ],
                "lastTriggered": "2026-02-24T02:00:00+05:30", "triggerCount": 5
            },
            {
                "id": "PB-004", "name": "Brute Force Mitigation", "severity": "high", "enabled": True, "triggerRule": "R-004",
                "steps": [
                    {"order": 1, "action": "Block source IP", "automated": True, "timeout": 15},
                    {"order": 2, "action": "Lock targeted account 30min", "automated": True, "timeout": 30},
                    {"order": 3, "action": "Alert SOC analyst", "automated": True, "timeout": 60},
                ],
                "lastTriggered": "2026-02-22T14:00:00+05:30", "triggerCount": 12
            },
            {
                "id": "PB-005", "name": "Phishing Response", "severity": "high", "enabled": True, "triggerRule": "R-003",
                "steps": [
                    {"order": 1, "action": "Quarantine email", "automated": True, "timeout": 30},
                    {"order": 2, "action": "Block sender domain", "automated": True, "timeout": 60},
                    {"order": 3, "action": "Scan recipient endpoints", "automated": True, "timeout": 300},
                    {"order": 4, "action": "Reset credentials if opened", "automated": False, "timeout": 3600},
                ],
                "lastTriggered": "2026-02-23T10:00:00+05:30", "triggerCount": 7
            },
            {
                "id": "PB-006", "name": "OT Anomaly Response", "severity": "high", "enabled": True, "triggerRule": "R-003",
                "steps": [
                    {"order": 1, "action": "Alert OT security team", "automated": True, "timeout": 60},
                    {"order": 2, "action": "Block external connection at OT firewall", "automated": False, "timeout": 300},
                    {"order": 3, "action": "Capture network traffic", "automated": True, "timeout": 120},
                ],
                "lastTriggered": "2026-02-23T04:00:00+05:30", "triggerCount": 2
            },
            {
                "id": "PB-007", "name": "Insider Threat Response", "severity": "medium", "enabled": True, "triggerRule": "R-010",
                "steps": [
                    {"order": 1, "action": "Log all user activity", "automated": True, "timeout": 30},
                    {"order": 2, "action": "Alert HR and Legal", "automated": True, "timeout": 300},
                    {"order": 3, "action": "Restrict access to sensitive shares", "automated": False, "timeout": 3600},
                ],
                "lastTriggered": "2026-02-21T23:45:00+05:30", "triggerCount": 1
            },
            {
                "id": "PB-008", "name": "Patch Compliance Escalation", "severity": "low", "enabled": True, "triggerRule": None,
                "steps": [
                    {"order": 1, "action": "Generate patch report", "automated": True, "timeout": 300},
                    {"order": 2, "action": "Email IT admin", "automated": True, "timeout": 60},
                    {"order": 3, "action": "Escalate if not patched in 7 days", "automated": True, "timeout": 604800},
                ],
                "lastTriggered": "2026-02-20T10:00:00+05:30", "triggerCount": 4
            },
        ]
    }