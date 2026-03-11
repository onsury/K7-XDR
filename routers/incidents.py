from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("")
def list_incidents(severity: str = None, status: str = None):
    store = get_data_store()
    incidents = store.get("incidents", [])
    if severity:
        incidents = [i for i in incidents if i.get("severity") == severity]
    if status:
        incidents = [i for i in incidents if i.get("status") == status]
    incidents = sorted(incidents, key=lambda x: x.get("createdAt", ""), reverse=True)
    return {
        "total": len(incidents),
        "incidents": [{
            "id": i["id"],
            "title": i["title"],
            "severity": i["severity"],
            "confidence": i.get("confidence", 0),
            "status": i["status"],
            "assignedTo": i.get("assignedTo", ""),
            "createdAt": i["createdAt"],
            "affectedDeviceCount": len(i.get("affectedDevices", [])),
            "mitreCount": len(i.get("mitreAttack", [])),
        } for i in incidents]
    }

@router.get("/{incident_id}")
def get_incident(incident_id: str):
    store = get_data_store()
    incidents = store.get("incidents", [])
    for inc in incidents:
        if inc["id"] == incident_id:
            return inc
    return {"error": "Incident not found"}

@router.put("/{incident_id}/status")
def update_status(incident_id: str, body: dict):
    store = get_data_store()
    for inc in store.get("incidents", []):
        if inc["id"] == incident_id:
            inc["status"] = body.get("status", inc["status"])
            return {"success": True, "incident": inc}
    return {"error": "Incident not found"}

@router.post("/{incident_id}/actions")
def add_action(incident_id: str, body: dict):
    store = get_data_store()
    for inc in store.get("incidents", []):
        if inc["id"] == incident_id:
            action = {
                "action": body.get("action", ""),
                "timestamp": body.get("timestamp", ""),
                "performedBy": body.get("performedBy", ""),
                "status": "pending",
                "automated": False,
            }
            inc.setdefault("responseActions", []).append(action)
            return {"success": True, "action": action}
    return {"error": "Incident not found"}