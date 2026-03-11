from fastapi import APIRouter

router = APIRouter()

@router.get("")
def get_compliance():
    return {
        "frameworks": [
            {
                "id": "cert_in",
                "name": "CERT-In",
                "description": "Indian Computer Emergency Response Team — 6-hour mandatory incident reporting",
                "score": 72,
                "controlsPassed": 18,
                "totalControls": 25,
                "controls": [
                    {"controlId": "CI-01", "name": "6-hour incident reporting to CERT-In", "status": "compliant", "evidence": "Automated via K7 XDR alert pipeline", "priority": "critical"},
                    {"controlId": "CI-02", "name": "Log retention minimum 180 days", "status": "compliant", "evidence": "Firestore retention policy active", "priority": "high"},
                    {"controlId": "CI-03", "name": "Vulnerability disclosure process", "status": "partial", "evidence": "Manual process — automation pending", "priority": "medium"},
                    {"controlId": "CI-04", "name": "Network traffic monitoring 24x7", "status": "compliant", "evidence": "K7 NDR active on all segments", "priority": "critical"},
                    {"controlId": "CI-05", "name": "Malware sample reporting", "status": "compliant", "evidence": "Auto-submit via K7 Threat Lab API", "priority": "high"},
                    {"controlId": "CI-06", "name": "Cybersecurity incident types coverage", "status": "compliant", "evidence": "All 20 CERT-In incident types mapped", "priority": "high"},
                    {"controlId": "CI-07", "name": "Point of contact registered with CERT-In", "status": "compliant", "evidence": "CISO registered as nodal officer", "priority": "medium"},
                    {"controlId": "CI-08", "name": "ICT system clock synchronization (NTP)", "status": "compliant", "evidence": "All devices synced to NIC NTP pool", "priority": "medium"},
                    {"controlId": "CI-09", "name": "Logs of firewall, IDS, proxy, mail", "status": "partial", "evidence": "Firewall and mail — yes. Proxy — partial", "priority": "high"},
                    {"controlId": "CI-10", "name": "CERT-In direction April 2022 compliance", "status": "partial", "evidence": "VPN logs not yet centralized", "priority": "critical"},
                ]
            },
            {
                "id": "dpdpa",
                "name": "DPDPA 2023",
                "description": "Digital Personal Data Protection Act — India's data privacy law",
                "score": 65,
                "controlsPassed": 13,
                "totalControls": 20,
                "controls": [
                    {"controlId": "DP-01", "name": "Data breach notification to Board within 72 hours", "status": "compliant", "evidence": "Automated breach detection triggers DPDPA workflow", "priority": "critical"},
                    {"controlId": "DP-02", "name": "Consent management for data processing", "status": "partial", "evidence": "Consent framework in progress", "priority": "high"},
                    {"controlId": "DP-03", "name": "Data localization — India DC only", "status": "compliant", "evidence": "All PII stored in Mumbai DC", "priority": "critical"},
                    {"controlId": "DP-04", "name": "Right to erasure implementation", "status": "non_compliant", "evidence": "Not implemented — roadmap Q3", "priority": "high"},
                    {"controlId": "DP-05", "name": "Data processing records maintained", "status": "partial", "evidence": "Partial logging via K7 XDR audit trail", "priority": "medium"},
                    {"controlId": "DP-06", "name": "Data Protection Officer appointed", "status": "compliant", "evidence": "DPO: Ananya Iyer, registered", "priority": "critical"},
                    {"controlId": "DP-07", "name": "Personal data breach impact assessment", "status": "compliant", "evidence": "Auto-trigger on data exfil incidents", "priority": "critical"},
                    {"controlId": "DP-08", "name": "Cross-border data transfer controls", "status": "compliant", "evidence": "No cross-border transfers — India only", "priority": "high"},
                    {"controlId": "DP-09", "name": "Children data processing safeguards", "status": "non_compliant", "evidence": "Age verification not implemented", "priority": "medium"},
                    {"controlId": "DP-10", "name": "Grievance redressal mechanism", "status": "partial", "evidence": "Email-based — portal pending", "priority": "medium"},
                ]
            },
            {
                "id": "rbi_csf",
                "name": "RBI CSF",
                "description": "Reserve Bank of India — Cybersecurity Framework for Banks & NBFCs",
                "score": 74,
                "controlsPassed": 15,
                "totalControls": 20,
                "controls": [
                    {"controlId": "RBI-01", "name": "Board-approved cybersecurity policy", "status": "compliant", "evidence": "Policy v3.2 approved by Board", "priority": "critical"},
                    {"controlId": "RBI-02", "name": "Cyber Security Operations Center (C-SOC)", "status": "compliant", "evidence": "K7 XDR platform as C-SOC", "priority": "critical"},
                    {"controlId": "RBI-03", "name": "Cyber incident reporting to RBI within 6 hours", "status": "compliant", "evidence": "Automated via CERT-In + RBI reporting pipeline", "priority": "critical"},
                    {"controlId": "RBI-04", "name": "Vulnerability assessment and penetration testing", "status": "partial", "evidence": "Last VAPT: 8 months ago — quarterly required", "priority": "high"},
                    {"controlId": "RBI-05", "name": "Network segmentation and access controls", "status": "compliant", "evidence": "VLAN segmentation monitored by K7 NDR", "priority": "high"},
                    {"controlId": "RBI-06", "name": "Advanced real-time threat detection", "status": "compliant", "evidence": "K7 XDR + Threat Intel feeds active", "priority": "critical"},
                    {"controlId": "RBI-07", "name": "Anti-phishing and anti-malware controls", "status": "compliant", "evidence": "K7 email security + endpoint protection", "priority": "high"},
                    {"controlId": "RBI-08", "name": "Customer data protection and encryption", "status": "compliant", "evidence": "AES-256 at rest, TLS 1.3 in transit", "priority": "critical"},
                    {"controlId": "RBI-09", "name": "Forensic readiness and evidence preservation", "status": "partial", "evidence": "K7 XDR logs — dedicated forensic toolkit pending", "priority": "medium"},
                    {"controlId": "RBI-10", "name": "Cyber crisis management plan", "status": "partial", "evidence": "8 playbooks defined — full crisis plan pending", "priority": "high"},
                    {"controlId": "RBI-11", "name": "IT outsourcing risk management", "status": "compliant", "evidence": "Vendor risk assessment completed", "priority": "medium"},
                    {"controlId": "RBI-12", "name": "Red team exercise annually", "status": "non_compliant", "evidence": "Not conducted — scheduled Q2", "priority": "high"},
                    {"controlId": "RBI-13", "name": "Cyber insurance coverage", "status": "compliant", "evidence": "Policy active — INR 50Cr coverage", "priority": "medium"},
                    {"controlId": "RBI-14", "name": "ATM and digital channel security", "status": "compliant", "evidence": "K7 endpoint protection on all ATMs", "priority": "high"},
                    {"controlId": "RBI-15", "name": "Secure configuration baseline", "status": "partial", "evidence": "CIS benchmarks — 78% compliant", "priority": "medium"},
                    {"controlId": "RBI-16", "name": "Privileged access management", "status": "compliant", "evidence": "PAM solution integrated with K7 XDR", "priority": "critical"},
                    {"controlId": "RBI-17", "name": "DDoS mitigation measures", "status": "compliant", "evidence": "Cloud-based DDoS protection active", "priority": "high"},
                    {"controlId": "RBI-18", "name": "Mobile banking security controls", "status": "partial", "evidence": "K7 Mobile Security on 10 devices", "priority": "high"},
                    {"controlId": "RBI-19", "name": "Cyber security awareness training", "status": "compliant", "evidence": "Quarterly training — 92% completion", "priority": "medium"},
                    {"controlId": "RBI-20", "name": "Third-party audit (IS audit)", "status": "non_compliant", "evidence": "Last audit 14 months ago — annual required", "priority": "high"},
                ]
            },
            {
                "id": "iso27001",
                "name": "ISO 27001",
                "description": "Information Security Management System",
                "score": 78,
                "controlsPassed": 86,
                "totalControls": 110,
                "controls": [
                    {"controlId": "A.5.1", "name": "Information security policies", "status": "compliant", "evidence": "Policy v3.2 approved", "priority": "high"},
                    {"controlId": "A.6.1", "name": "Organization of information security", "status": "compliant", "evidence": "CISO appointed", "priority": "high"},
                    {"controlId": "A.8.1", "name": "Asset management", "status": "partial", "evidence": "K7 device inventory — 50 assets", "priority": "medium"},
                    {"controlId": "A.9.1", "name": "Access control", "status": "compliant", "evidence": "RBAC enforced via AD", "priority": "high"},
                    {"controlId": "A.12.4", "name": "Logging and monitoring", "status": "compliant", "evidence": "K7 XDR active 24x7", "priority": "critical"},
                ]
            },
            {
                "id": "nist_csf",
                "name": "NIST CSF",
                "description": "Cybersecurity Framework v2.0",
                "score": 71,
                "controlsPassed": 32,
                "totalControls": 45,
                "controls": [
                    {"controlId": "ID.AM", "name": "Asset Management", "status": "compliant", "evidence": "50 devices tracked", "priority": "high"},
                    {"controlId": "PR.AC", "name": "Access Control", "status": "compliant", "evidence": "4-role RBAC", "priority": "high"},
                    {"controlId": "DE.CM", "name": "Continuous Monitoring", "status": "compliant", "evidence": "K7 XDR 24x7", "priority": "critical"},
                    {"controlId": "RS.RP", "name": "Response Planning", "status": "partial", "evidence": "8 playbooks active", "priority": "high"},
                    {"controlId": "RC.RP", "name": "Recovery Planning", "status": "non_compliant", "evidence": "DR plan pending", "priority": "high"},
                ]
            },
            {
                "id": "pci_dss",
                "name": "PCI DSS 4.0",
                "description": "Payment Card Industry Data Security Standard",
                "score": 58,
                "controlsPassed": 7,
                "totalControls": 12,
                "controls": [
                    {"controlId": "R1", "name": "Network security controls", "status": "compliant", "evidence": "Firewall monitored by K7", "priority": "critical"},
                    {"controlId": "R3", "name": "Protect stored account data", "status": "partial", "evidence": "Encryption partial", "priority": "critical"},
                    {"controlId": "R6", "name": "Secure systems and software", "status": "non_compliant", "evidence": "12 unpatched endpoints", "priority": "high"},
                    {"controlId": "R10", "name": "Log and monitor access", "status": "compliant", "evidence": "K7 XDR logging", "priority": "critical"},
                    {"controlId": "R11", "name": "Test security regularly", "status": "partial", "evidence": "Quarterly scans", "priority": "high"},
                ]
            },
            {
                "id": "sebi",
                "name": "SEBI CSCRF",
                "description": "Securities and Exchange Board of India — Cyber Security Framework",
                "score": 69,
                "controlsPassed": 11,
                "totalControls": 16,
                "controls": [
                    {"controlId": "S-01", "name": "SOC establishment", "status": "compliant", "evidence": "K7 XDR as SOC platform", "priority": "high"},
                    {"controlId": "S-02", "name": "Cyber resilience policy", "status": "compliant", "evidence": "Board approved", "priority": "high"},
                    {"controlId": "S-03", "name": "Incident response plan", "status": "partial", "evidence": "8 playbooks defined", "priority": "high"},
                    {"controlId": "S-04", "name": "Regular VAPT", "status": "non_compliant", "evidence": "Last VAPT 8 months ago", "priority": "critical"},
                    {"controlId": "S-05", "name": "Cyber audit", "status": "partial", "evidence": "Internal only", "priority": "high"},
                ]
            },
        ]
    }