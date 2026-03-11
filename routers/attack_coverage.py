from fastapi import APIRouter
from data.seed import get_data_store

router = APIRouter()

@router.get("")
def get_attack_coverage():
    store = get_data_store()
    incidents = store.get("incidents", [])
    alerts = store.get("alerts", [])

    technique_map = {}
    for inc in incidents:
        for m in inc.get("mitreAttack", []):
            tid = m.get("techniqueId", "")
            if tid not in technique_map:
                technique_map[tid] = {"techniqueId": tid, "tacticName": m.get("tacticName", ""), "techniqueName": m.get("techniqueName", ""), "incidentCount": 0, "alertCount": 0, "detected": True}
            technique_map[tid]["incidentCount"] += 1

    for a in alerts:
        tid = a.get("mitreTechnique", "")
        if tid:
            if tid not in technique_map:
                technique_map[tid] = {"techniqueId": tid, "tacticName": "", "techniqueName": "", "incidentCount": 0, "alertCount": 0, "detected": True}
            technique_map[tid]["alertCount"] += 1

    tactics = [
        {"id": "TA0001", "name": "Initial Access", "techniques": 4, "covered": 2},
        {"id": "TA0002", "name": "Execution", "techniques": 7, "covered": 4},
        {"id": "TA0003", "name": "Persistence", "techniques": 6, "covered": 3},
        {"id": "TA0004", "name": "Privilege Escalation", "techniques": 5, "covered": 2},
        {"id": "TA0005", "name": "Defense Evasion", "techniques": 8, "covered": 3},
        {"id": "TA0006", "name": "Credential Access", "techniques": 5, "covered": 3},
        {"id": "TA0007", "name": "Discovery", "techniques": 6, "covered": 1},
        {"id": "TA0008", "name": "Lateral Movement", "techniques": 4, "covered": 3},
        {"id": "TA0009", "name": "Collection", "techniques": 4, "covered": 2},
        {"id": "TA0010", "name": "Exfiltration", "techniques": 3, "covered": 2},
        {"id": "TA0011", "name": "Command and Control", "techniques": 5, "covered": 3},
        {"id": "TA0040", "name": "Impact", "techniques": 4, "covered": 2},
    ]

    total_techniques = sum(t["techniques"] for t in tactics)
    covered_techniques = sum(t["covered"] for t in tactics)

    return {
        "overallCoverage": round(covered_techniques / total_techniques * 100),
        "tactics": tactics,
        "detectedTechniques": list(technique_map.values()),
        "totalTechniques": total_techniques,
        "coveredTechniques": covered_techniques,
        "k7DetectionRules": 847,
    }