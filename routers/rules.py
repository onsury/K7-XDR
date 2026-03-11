from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_rules():
    return {
        "total": 12,
        "rules": [
            {"id": "R-001", "name": "Ransomware File Encryption", "severity": "critical", "enabled": True, "source": "k7_engine", "mitre": "T1486", "hits30d": 3},
            {"id": "R-002", "name": "LSASS Credential Dump", "severity": "critical", "enabled": True, "source": "k7_engine", "mitre": "T1003.001", "hits30d": 5},
            {"id": "R-003", "name": "C2 Callback Detection", "severity": "high", "enabled": True, "source": "k7_xdr", "mitre": "T1071.001", "hits30d": 18},
            {"id": "R-004", "name": "Brute Force RDP", "severity": "high", "enabled": True, "source": "k7_xdr", "mitre": "T1110.001", "hits30d": 12},
            {"id": "R-005", "name": "Lateral Movement SMB", "severity": "high", "enabled": True, "source": "k7_xdr", "mitre": "T1021.002", "hits30d": 8},
            {"id": "R-006", "name": "DNS Tunneling", "severity": "high", "enabled": True, "source": "k7_xdr", "mitre": "T1071.004", "hits30d": 4},
            {"id": "R-007", "name": "Encoded PowerShell", "severity": "medium", "enabled": True, "source": "k7_engine", "mitre": "T1059.001", "hits30d": 22},
            {"id": "R-008", "name": "Registry Persistence", "severity": "medium", "enabled": True, "source": "k7_engine", "mitre": "T1547.001", "hits30d": 9},
            {"id": "R-009", "name": "Suspicious Scheduled Task", "severity": "medium", "enabled": True, "source": "k7_xdr", "mitre": "T1053.005", "hits30d": 6},
            {"id": "R-010", "name": "Data Exfiltration Large Transfer", "severity": "high", "enabled": True, "source": "k7_xdr", "mitre": "T1041", "hits30d": 3},
            {"id": "R-011", "name": "USB Mass Storage", "severity": "low", "enabled": False, "source": "k7_xdr", "mitre": "T1091", "hits30d": 14},
            {"id": "R-012", "name": "Proxy Bypass Attempt", "severity": "low", "enabled": True, "source": "k7_xdr", "mitre": "T1090", "hits30d": 7},
        ]
    }