from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("")
def list_alerts(severity: str = None, source: str = None, status: str = None):
    store = get_data_store()
    alerts = store.get("alerts", [])
    if severity:
        alerts = [a for a in alerts if a.get("severity") == severity]
    if source:
        alerts = [a for a in alerts if a.get("source") == source]
    if status:
        alerts = [a for a in alerts if a.get("status") == status]
    alerts = sorted(alerts, key=lambda x: x.get("timestamp", ""), reverse=True)
    return {
        "total": len(alerts),
        "alerts": alerts[:100],
        "summary": {
            "bySeverity": _count(store.get("alerts", []), "severity"),
            "bySource": _count(store.get("alerts", []), "source"),
            "byStatus": _count(store.get("alerts", []), "status"),
        }
    }

@router.get("/{alert_id}")
def get_alert(alert_id: str):
    store = get_data_store()
    for a in store.get("alerts", []):
        if a["id"] == alert_id:
            return a
    return {"error": "Alert not found"}

@router.put("/{alert_id}/status")
def update_alert_status(alert_id: str, body: dict):
    store = get_data_store()
    for a in store.get("alerts", []):
        if a["id"] == alert_id:
            a["status"] = body.get("status", a["status"])
            return {"success": True, "alert": a}
    return {"error": "Alert not found"}

def _count(items, field):
    counts = {}
    for item in items:
        val = item.get(field, "unknown")
        counts[val] = counts.get(val, 0) + 1
    return counts