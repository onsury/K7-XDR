from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("")
def get_dashboard():
    store = get_data_store()
    incidents = store.get("incidents", [])
    devices = store.get("devices", [])
    alerts = store.get("alerts", [])

    severity_count = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    status_count = {"new": 0, "investigating": 0, "contained": 0, "resolved": 0}
    for inc in incidents:
        sev = inc.get("severity", "low")
        if sev in severity_count:
            severity_count[sev] += 1
        st = inc.get("status", "new")
        if st in status_count:
            status_count[st] += 1

    active_agents = sum(1 for d in devices if d.get("agentStatus") == "active")
    high_risk = sum(1 for d in devices if d.get("riskScore", 0) >= 70)

    alert_by_source = {}
    for a in alerts:
        src = a.get("source", "unknown")
        alert_by_source[src] = alert_by_source.get(src, 0) + 1

    recent_incidents = sorted(incidents, key=lambda x: x.get("createdAt", ""), reverse=True)[:10]

    return {
        "summary": {
            "totalIncidents": len(incidents),
            "totalDevices": len(devices),
            "totalAlerts": len(alerts),
            "activeAgents": active_agents,
            "highRiskDevices": high_risk,
            "severityBreakdown": severity_count,
            "statusBreakdown": status_count,
            "alertsBySource": alert_by_source,
        },
        "recentIncidents": [{
            "id": i["id"],
            "title": i["title"],
            "severity": i["severity"],
            "status": i["status"],
            "createdAt": i["createdAt"],
        } for i in recent_incidents],
        "riskScore": {
            "overall": 67,
            "trend": "increasing",
            "factors": [
                {"name": "Unpatched Systems", "score": 78},
                {"name": "Active Threats", "score": 85},
                {"name": "Compliance Gaps", "score": 42},
                {"name": "Agent Coverage", "score": 72},
            ]
        },
        "k7EngineStatus": {
            "scanEngine": {"status": "connected", "lastUpdate": "2026-02-24T10:00:00+05:30", "version": "25.2.1"},
            "threatIntel": {"status": "connected", "feedsActive": 12, "lastSync": "2026-02-24T14:00:00+05:30"},
            "deceptionTech": {"status": "standby", "honeypots": 5, "triggered": 2},
        }
    }