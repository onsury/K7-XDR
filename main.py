import os
import uvicorn
import pathlib
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware

from firebase_config import init_firebase
from data.seed import seed_all_data, get_data_store
from routers import (
    dashboard, incidents, devices, alerts, compliance,
    threat_hunt, attack_coverage, rules, playbooks,
    reports, integrations, users, threat_intel, actions_log,
    compliance_workflow
)

_INDEX_PATH = pathlib.Path("frontend/dist/index.html")

class SPAMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api"):
            return HTMLResponse(_INDEX_PATH.read_text())
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    firebase_ok = init_firebase()
    seed_all_data(use_firestore=firebase_ok)
    print("K7 XDR Backend ready")
    yield

app = FastAPI(title="K7 XDR Platform API", version="1.0.0-mvp", lifespan=lifespan)

app.add_middleware(SPAMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(compliance_workflow.router, prefix="/api/certin-dpdpa", tags=["Compliance Workflow"])
app.include_router(threat_hunt.router, prefix="/api/threat-hunt", tags=["Threat Hunt"])
app.include_router(attack_coverage.router, prefix="/api/attack-coverage", tags=["ATT&CK Coverage"])
app.include_router(rules.router, prefix="/api/ru                                                                                                                                                                                                                                                                    les", tags=["Detection Rules"])
app.include_router(playbooks.router, prefix="/api/playbooks", tags=["Playbooks"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(threat_intel.router, prefix="/api/threat-intel", tags=["Threat Intel"])
app.include_router(actions_log.router, prefix="/api/actions-log", tags=["Actions Log"])

@app.get("/api/health")
def health_check():
    store = get_data_store()
    return {
        "status": "healthy",
        "platform": "K7 XDR",
        "version": "1.0.0-mvp",
        "data": {
            "incidents": len(store.get("incidents", [])),
            "devices": len(store.get("devices", [])),
            "alerts": len(store.get("alerts", []))
        }
    }

@app.get("/api/auth/login")
def get_demo_users():
    return {
        "users": [
            {"email": "analyst@k7xdr.demo", "password": "analyst123", "role": "SOC Analyst", "name": "Vikram Patel"},
            {"email": "manager@k7xdr.demo", "password": "manager123", "role": "SOC Manager", "name": "Deepa Nair"},
            {"email": "ciso@k7xdr.demo", "password": "ciso123", "role": "CISO", "name": "Venkat Raghavan"},
            {"email": "auditor@k7xdr.demo", "password": "auditor123", "role": "Auditor", "name": "Ananya Iyer"},
        ]
    }

@app.post("/api/auth/login")
def login(credentials: dict):
    demo_users = {
        "analyst@k7xdr.demo": {"password": "analyst123", "role": "soc_analyst", "name": "Vikram Patel"},
        "manager@k7xdr.demo": {"password": "manager123", "role": "soc_manager", "name": "Deepa Nair"},
        "ciso@k7xdr.demo": {"password": "ciso123", "role": "ciso", "name": "Venkat Raghavan"},
        "auditor@k7xdr.demo": {"password": "auditor123", "role": "auditor", "name": "Ananya Iyer"},
    }
    email = credentials.get("email", "")
    password = credentials.get("password", "")
    user = demo_users.get(email)
    if user and user["password"] == password:
        return {"success": True, "user": {"email": email, "role": user["role"], "name": user["name"]}}
    return {"success": False, "error": "Invalid credentials"}

app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)