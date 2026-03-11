#!/bin/bash
# ===========================================================
# K7 AegisXDR — Wazuh Agent Installation Script
# ===========================================================
# Deploy this on every client endpoint to start collecting telemetry.
# 
# USAGE:
#   curl -sO https://aegis.k7computing.com/install-agent.sh
#   chmod +x install-agent.sh
#   sudo ./install-agent.sh <MANAGER_IP> <AGENT_GROUP>
#
# EXAMPLES:
#   sudo ./install-agent.sh 10.7.1.100 production
#   sudo ./install-agent.sh aegis-manager.k7.local bfsi-client
#
# SUPPORTED:
#   Ubuntu/Debian, CentOS/RHEL, Windows (separate script)
# ===========================================================

set -e

MANAGER_IP="${1:-10.7.1.100}"
AGENT_GROUP="${2:-default}"
WAZUH_VERSION="4.9.0"

echo "============================================="
echo "  K7 AegisXDR — Wazuh Agent Installation"
echo "============================================="
echo "  Manager: ${MANAGER_IP}"
echo "  Group:   ${AGENT_GROUP}"
echo "  Version: ${WAZUH_VERSION}"
echo "============================================="

# Detect OS
if [ -f /etc/debian_version ]; then
    OS="debian"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
else
    echo "ERROR: Unsupported OS. Use Windows installer for Windows endpoints."
    exit 1
fi

echo "[1/4] Installing Wazuh repository..."

if [ "$OS" = "debian" ]; then
    curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
    echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee /etc/apt/sources.list.d/wazuh.list
    apt-get update -q
elif [ "$OS" = "redhat" ]; then
    rpm --import https://packages.wazuh.com/key/GPG-KEY-WAZUH
    cat > /etc/yum.repos.d/wazuh.repo << 'REPO'
[wazuh]
gpgcheck=1
gpgkey=https://packages.wazuh.com/key/GPG-KEY-WAZUH
enabled=1
name=Wazuh repository
baseurl=https://packages.wazuh.com/4.x/yum/
protect=1
REPO
fi

echo "[2/4] Installing Wazuh agent..."

if [ "$OS" = "debian" ]; then
    WAZUH_MANAGER="${MANAGER_IP}" WAZUH_AGENT_GROUP="${AGENT_GROUP}" apt-get install -y wazuh-agent
elif [ "$OS" = "redhat" ]; then
    WAZUH_MANAGER="${MANAGER_IP}" WAZUH_AGENT_GROUP="${AGENT_GROUP}" yum install -y wazuh-agent
fi

echo "[3/4] Configuring agent..."

# Set manager address in ossec.conf
sed -i "s|<address>.*</address>|<address>${MANAGER_IP}</address>|" /var/ossec/etc/ossec.conf

echo "[4/4] Starting agent..."

systemctl daemon-reload
systemctl enable wazuh-agent
systemctl start wazuh-agent

# Verify
sleep 5
AGENT_STATUS=$(systemctl is-active wazuh-agent)

echo ""
echo "============================================="
if [ "$AGENT_STATUS" = "active" ]; then
    echo "  ✅ Agent installed and running!"
    echo "  Agent ID: $(cat /var/ossec/etc/client.keys 2>/dev/null | awk '{print $1}' | head -1)"
else
    echo "  ❌ Agent installed but not running."
    echo "  Check: journalctl -u wazuh-agent"
fi
echo "  Manager: ${MANAGER_IP}"
echo "  Group:   ${AGENT_GROUP}"
echo "============================================="