from fastapi import APIRouter

router = APIRouter()

@router.get("")
def get_threat_intel():
    return {
        "feeds": [
            {"name": "K7 Threat Lab", "status": "active", "iocCount": 45200, "lastUpdate": "2026-02-24T14:00:00+05:30"},
            {"name": "CERT-In Advisories", "status": "active", "iocCount": 1280, "lastUpdate": "2026-02-24T12:00:00+05:30"},
            {"name": "AlienVault OTX", "status": "active", "iocCount": 128000, "lastUpdate": "2026-02-24T13:00:00+05:30"},
            {"name": "Abuse.ch", "status": "active", "iocCount": 89000, "lastUpdate": "2026-02-24T14:15:00+05:30"},
        ],
        "recentIocs": [
            {"type": "ip", "value": "91.215.85.142", "threat": "Ransomware C2", "confidence": 95, "source": "K7 Threat Lab", "firstSeen": "2026-02-24T10:00:00+05:30"},
            {"type": "ip", "value": "185.156.73.44", "threat": "Data Exfiltration", "confidence": 90, "source": "K7 Threat Lab", "firstSeen": "2026-02-24T04:00:00+05:30"},
            {"type": "domain", "value": "xyz123.suspicious-domain.cc", "threat": "DNS Tunneling C2", "confidence": 85, "source": "AlienVault OTX", "firstSeen": "2026-02-21T08:00:00+05:30"},
            {"type": "hash", "value": "a1b2c3d4e5f6789012345678abcdef01", "threat": "Trojanized npm package", "confidence": 92, "source": "K7 Threat Lab", "firstSeen": "2026-02-24T06:00:00+05:30"},
            {"type": "ip", "value": "103.45.67.89", "threat": "Brute Force Source", "confidence": 88, "source": "Abuse.ch", "firstSeen": "2026-02-22T14:00:00+05:30"},
            {"type": "ip", "value": "45.67.89.12", "threat": "OT Targeting", "confidence": 80, "source": "CERT-In Advisories", "firstSeen": "2026-02-23T02:00:00+05:30"},
        ]
    }