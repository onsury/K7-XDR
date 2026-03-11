from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("/saved-queries")
def get_saved_queries():
    return {
        "queries": [
            {"id": "q1", "name": "Find all PowerShell executions", "query": "source:endpoint AND alertName:PowerShell", "createdBy": "vikram.patel"},
            {"id": "q2", "name": "External C2 connections", "query": "source:network AND severity:high AND mitre:T1071", "createdBy": "vikram.patel"},
            {"id": "q3", "name": "Failed logins last 24h", "query": "source:identity AND alertName:Failed login", "createdBy": "deepa.nair"},
            {"id": "q4", "name": "Lateral movement indicators", "query": "mitre:T1021 OR mitre:T1091", "createdBy": "vikram.patel"},
            {"id": "q5", "name": "Data exfiltration signals", "query": "mitre:T1041 OR mitre:T1048 OR alertName:Large outbound", "createdBy": "deepa.nair"},
            {"id": "q6", "name": "OT/IoT anomalies", "query": "deviceType:ot OR deviceType:iot AND severity:high", "createdBy": "analyst"},
        ]
    }

@router.post("/search")
def search_threats(body: dict):
    query = body.get("query", "").lower()
    store = get_data_store()
    alerts = store.get("alerts", [])
    incidents = store.get("incidents", [])

    matched_alerts = []
    for a in alerts:
        searchable = f"{a.get('alertName','')} {a.get('source','')} {a.get('severity','')} {a.get('mitreTechnique','')} {a.get('deviceId','')}".lower()
        if query in searchable:
            matched_alerts.append(a)

    matched_incidents = []
    for i in incidents:
        searchable = f"{i.get('title','')} {i.get('description','')} {i.get('severity','')}".lower()
        if query in searchable:
            matched_incidents.append({
                "id": i["id"],
                "title": i["title"],
                "severity": i["severity"],
                "status": i["status"],
            })

    return {
        "query": body.get("query", ""),
        "total": len(matched_alerts) + len(matched_incidents),
        "alerts": matched_alerts[:50],
        "incidents": matched_incidents[:20],
    }