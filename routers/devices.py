from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("")
def list_devices(device_type: str = None, agent_status: str = None):
    store = get_data_store()
    devices = store.get("devices", [])
    if device_type:
        devices = [d for d in devices if d.get("type") == device_type]
    if agent_status:
        devices = [d for d in devices if d.get("agentStatus") == agent_status]
    return {
        "total": len(devices),
        "devices": devices,
        "summary": {
            "byType": _count_by(store.get("devices", []), "type"),
            "byAgent": _count_by(store.get("devices", []), "agentStatus"),
            "byLocation": _count_by(store.get("devices", []), "location"),
        }
    }

@router.get("/{device_id}")
def get_device(device_id: str):
    store = get_data_store()
    for d in store.get("devices", []):
        if d["id"] == device_id:
            related = [i for i in store.get("incidents", [])
                       for ad in i.get("affectedDevices", [])
                       if ad.get("deviceId") == device_id]
            d["relatedIncidents"] = [{"id": i["id"], "title": i["title"], "severity": i["severity"]} for i in related]
            return d
    return {"error": "Device not found"}

def _count_by(items, field):
    counts = {}
    for item in items:
        val = item.get(field, "unknown")
        counts[val] = counts.get(val, 0) + 1
    return counts