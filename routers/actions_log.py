from fastapi import APIRouter

router = APIRouter()

@router.get("")
def get_actions_log():
    return {
        "actions": [
            {"id": "ACT-001", "timestamp": "2026-02-24T12:27:00+05:30", "action": "Isolate Endpoint", "target": "SRV-DB-PROD-02", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0001"},
            {"id": "ACT-002", "timestamp": "2026-02-24T12:35:00+05:30", "action": "Block C2 IP", "target": "91.215.85.142", "performedBy": "vikram.patel", "status": "completed", "incidentId": "INC-0001"},
            {"id": "ACT-003", "timestamp": "2026-02-24T09:20:00+05:30", "action": "Block Outbound IP", "target": "185.156.73.44", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0002"},
            {"id": "ACT-004", "timestamp": "2026-02-24T06:10:00+05:30", "action": "Quarantine Package", "target": "lodash-utils-pro", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0003"},
            {"id": "ACT-005", "timestamp": "2026-02-24T02:28:00+05:30", "action": "Isolate Endpoint", "target": "DESKTOP-FIN-PRIYA", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0004"},
            {"id": "ACT-006", "timestamp": "2026-02-23T16:40:00+05:30", "action": "Block IP at Firewall", "target": "45.67.89.12", "performedBy": "vikram.patel", "status": "completed", "incidentId": "INC-0007"},
            {"id": "ACT-007", "timestamp": "2026-02-22T14:25:00+05:30", "action": "Block Source IP", "target": "103.45.67.89", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0008"},
            {"id": "ACT-008", "timestamp": "2026-02-22T10:10:00+05:30", "action": "Block IP Range", "target": "12 rotating IPs", "performedBy": "K7 XDR Auto", "status": "completed", "incidentId": "INC-0013"},
            {"id": "ACT-009", "timestamp": "2026-02-17T23:00:00+05:30", "action": "Revert GPO", "target": "DisableDefender", "performedBy": "vikram.patel", "status": "completed", "incidentId": "INC-0021"},
        ]
    }