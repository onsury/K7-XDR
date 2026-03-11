from fastapi import APIRouter
from data.seed import get_data_store
from datetime import datetime, timedelta, timezone

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))
CERT_IN_HOURS = 6
DPDPA_HOURS = 72

@router.get("/timers")
def get_compliance_timers():
    store = get_data_store()
    incidents = store.get("incidents", [])
    now = datetime.now(IST)
    timers = []

    for inc in incidents:
        if inc.get("severity") in ["critical", "high"]:
            created = inc.get("createdAt", "")
            try:
                created_dt = datetime.fromisoformat(created)
                if created_dt.tzinfo is None:
                    created_dt = created_dt.replace(tzinfo=IST)

                cert_deadline = created_dt + timedelta(hours=CERT_IN_HOURS)
                remaining = (cert_deadline - now).total_seconds()
                reported = inc.get("complianceFlags", {}).get("certInReportGenerated", False)

                timers.append({
                    "incidentId": inc["id"],
                    "title": inc["title"],
                    "severity": inc["severity"],
                    "type": "cert_in",
                    "label": "CERT-In 6-Hour Reporting",
                    "createdAt": created,
                    "deadline": cert_deadline.isoformat(),
                    "remainingSeconds": max(remaining, 0),
                    "totalSeconds": CERT_IN_HOURS * 3600,
                    "expired": remaining <= 0,
                    "reported": reported,
                    "status": "reported" if reported else ("expired" if remaining <= 0 else "active"),
                })
            except Exception as e:
                print(f"Timer error {inc['id']}: {e}")

        has_data_keywords = any(kw in (inc.get("title", "") + inc.get("description", "")).lower()
                               for kw in ["exfiltration", "data", "personal", "customer", "financial"])
        if inc.get("complianceFlags", {}).get("dpdpaAssessmentRequired", False) or has_data_keywords:
            created = inc.get("createdAt", "")
            try:
                created_dt = datetime.fromisoformat(created)
                if created_dt.tzinfo is None:
                    created_dt = created_dt.replace(tzinfo=IST)

                dpdpa_deadline = created_dt + timedelta(hours=DPDPA_HOURS)
                remaining = (dpdpa_deadline - now).total_seconds()

                timers.append({
                    "incidentId": inc["id"],
                    "title": inc["title"],
                    "severity": inc["severity"],
                    "type": "dpdpa",
                    "label": "DPDPA 72-Hour Breach Notification",
                    "createdAt": created,
                    "deadline": dpdpa_deadline.isoformat(),
                    "remainingSeconds": max(remaining, 0),
                    "totalSeconds": DPDPA_HOURS * 3600,
                    "expired": remaining <= 0,
                    "reported": False,
                    "status": "expired" if remaining <= 0 else "active",
                })
            except Exception as e:
                print(f"DPDPA timer error {inc['id']}: {e}")

    timers.sort(key=lambda t: (0 if t["status"] == "active" else 1, t["remainingSeconds"]))
    return {"timers": timers}

@router.get("/dpdpa-assessment/{incident_id}")
def get_dpdpa_assessment(incident_id: str):
    store = get_data_store()
    for inc in store.get("incidents", []):
        if inc["id"] == incident_id:
            title_desc = (inc.get("title", "") + inc.get("description", "")).lower()
            has_pii = any(kw in title_desc for kw in ["exfiltration", "data", "personal", "customer", "financial", "hr"])
            has_financial = "financial" in title_desc or "finance" in title_desc
            return {
                "incidentId": incident_id,
                "title": inc["title"],
                "severity": inc["severity"],
                "assessmentRequired": True,
                "steps": [
                    {"step": 1, "name": "Identify personal data involved", "status": "completed" if has_pii else "pending", "description": "Determine if personal data as defined under DPDPA Section 2(t) is affected"},
                    {"step": 2, "name": "Assess data principal impact", "status": "completed" if has_financial else "pending", "description": "Evaluate harm to data principals whose data may be compromised"},
                    {"step": 3, "name": "Determine breach notification requirement", "status": "pending", "description": "Check if breach meets threshold for mandatory notification under Section 8"},
                    {"step": 4, "name": "Notify Data Protection Board", "status": "pending", "description": "Submit breach notification to DPB within 72 hours of awareness"},
                    {"step": 5, "name": "Notify affected data principals", "status": "pending", "description": "Inform affected individuals about the breach and remedial measures"},
                    {"step": 6, "name": "Document remedial actions", "status": "pending", "description": "Record all steps taken to mitigate impact and prevent recurrence"},
                ],
                "dataClassification": {
                    "personalData": has_pii,
                    "sensitivePersonalData": has_financial,
                    "childrenData": False,
                    "crossBorder": False,
                },
                "riskLevel": "high" if has_pii else "low",
                "dpoNotified": False,
                "boardNotified": False,
            }
    return {"error": "Incident not found"}