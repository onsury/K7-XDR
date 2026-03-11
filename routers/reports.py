from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_reports():
    return {
        "reports": [
            {"id": "RPT-001", "name": "Weekly Incident Summary", "type": "scheduled", "frequency": "weekly", "lastGenerated": "2026-02-23T06:00:00+05:30", "format": "pdf"},
            {"id": "RPT-002", "name": "CERT-In Compliance Report", "type": "compliance", "frequency": "monthly", "lastGenerated": "2026-02-01T06:00:00+05:30", "format": "pdf"},
            {"id": "RPT-003", "name": "DPDPA Breach Assessment", "type": "compliance", "frequency": "on-demand", "lastGenerated": "2026-02-24T09:30:00+05:30", "format": "pdf"},
            {"id": "RPT-004", "name": "Executive Risk Dashboard", "type": "executive", "frequency": "daily", "lastGenerated": "2026-02-24T06:00:00+05:30", "format": "pdf"},
            {"id": "RPT-005", "name": "Device Risk Assessment", "type": "operational", "frequency": "weekly", "lastGenerated": "2026-02-23T06:00:00+05:30", "format": "xlsx"},
            {"id": "RPT-006", "name": "ATT&CK Coverage Gap Analysis", "type": "strategic", "frequency": "monthly", "lastGenerated": "2026-02-01T06:00:00+05:30", "format": "pdf"},
            {"id": "RPT-007", "name": "SOC Analyst Performance", "type": "operational", "frequency": "weekly", "lastGenerated": "2026-02-23T06:00:00+05:30", "format": "pdf"},
            {"id": "RPT-008", "name": "Threat Intelligence Digest", "type": "tactical", "frequency": "daily", "lastGenerated": "2026-02-24T06:00:00+05:30", "format": "pdf"},
        ]
    }