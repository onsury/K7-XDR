from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_users():
    return {
        "users": [
            {"id": "U-001", "name": "Vikram Patel", "email": "vikram.patel@k7xdr.demo", "role": "soc_analyst", "status": "active", "incidentsHandled": 18, "lastActive": "2026-02-24T14:25:00+05:30"},
            {"id": "U-002", "name": "Deepa Nair", "email": "deepa.nair@k7xdr.demo", "role": "soc_analyst", "status": "active", "incidentsHandled": 12, "lastActive": "2026-02-24T13:50:00+05:30"},
            {"id": "U-003", "name": "Venkat Raghavan", "email": "ciso@k7xdr.demo", "role": "ciso", "status": "active", "incidentsHandled": 0, "lastActive": "2026-02-24T11:00:00+05:30"},
            {"id": "U-004", "name": "Ananya Iyer", "email": "auditor@k7xdr.demo", "role": "auditor", "status": "active", "incidentsHandled": 0, "lastActive": "2026-02-24T09:00:00+05:30"},
            {"id": "U-005", "name": "SOC Analyst", "email": "analyst@k7xdr.demo", "role": "soc_analyst", "status": "active", "incidentsHandled": 24, "lastActive": "2026-02-24T14:30:00+05:30"},
        ]
    }