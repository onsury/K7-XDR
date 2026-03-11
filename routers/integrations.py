from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_integrations():
    return {
        "integrations": [
            {"id": "INT-001", "name": "K7 Scan Engine", "type": "k7_engine", "status": "connected", "version": "25.2.1", "lastSync": "2026-02-24T14:00:00+05:30", "description": "Core malware detection and file scanning engine"},
            {"id": "INT-002", "name": "K7 Threat Intelligence", "type": "k7_threat_intel", "status": "connected", "feedCount": 12, "lastSync": "2026-02-24T14:00:00+05:30", "description": "Real-time threat feeds and IoC database"},
            {"id": "INT-003", "name": "K7 Deception Technology", "type": "k7_deception", "status": "standby", "honeypots": 5, "lastSync": "2026-02-24T10:00:00+05:30", "description": "Honeypots and decoy systems for attacker detection"},
            {"id": "INT-004", "name": "K7 Mobile Security", "type": "k7_mobile", "status": "connected", "devicesManaged": 10, "lastSync": "2026-02-24T13:00:00+05:30", "description": "Mobile device threat protection and management"},
            {"id": "INT-005", "name": "K7 SD-WAN Security", "type": "k7_sdwan", "status": "not_configured", "lastSync": None, "description": "Secure SD-WAN traffic inspection and policy enforcement"},
            {"id": "INT-006", "name": "Active Directory", "type": "identity", "status": "connected", "usersMonitored": 245, "lastSync": "2026-02-24T14:15:00+05:30", "description": "AD user and group monitoring"},
            {"id": "INT-007", "name": "FortiGate Firewall", "type": "network", "status": "connected", "logsPerDay": 45000, "lastSync": "2026-02-24T14:20:00+05:30", "description": "Perimeter firewall log ingestion"},
            {"id": "INT-008", "name": "Microsoft 365", "type": "email", "status": "connected", "mailboxesMonitored": 180, "lastSync": "2026-02-24T14:10:00+05:30", "description": "Email security and phishing detection"},
            {"id": "INT-009", "name": "AWS CloudTrail", "type": "cloud", "status": "connected", "eventsPerDay": 12000, "lastSync": "2026-02-24T14:05:00+05:30", "description": "AWS API activity monitoring"},
            {"id": "INT-010", "name": "Slack Notifications", "type": "notification", "status": "connected", "channel": "#soc-alerts", "lastSync": "2026-02-24T14:25:00+05:30", "description": "Alert notifications to SOC Slack channel"},
        ]
    }