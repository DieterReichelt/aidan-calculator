#!/bin/bash

################################################################################
# Git SSH Key Setup Script
# Purpose: Configure SSH keys for secure Git access (Gitea/GitHub) on production server
# Usage: sudo ./setup-ssh.sh [--user www-data]
################################################################################

set -e

# Configuration
SSH_USER="${1:-$USER}"
SSH_USER="${SSH_USER#--user }"  # Handle --user flag
SSH_HOME=$(eval echo "~${SSH_USER}")
SSH_DIR="${SSH_HOME}/.ssh"
SSH_KEY_FILE="${SSH_DIR}/id_ed25519_git"
SSH_CONFIG_FILE="${SSH_DIR}/config"
GIT_HOST="${GIT_HOST:-github.com}"

# Strip protocol and path if accidentally provided (e.g., https://host.com/path -> host.com)
GIT_HOST="${GIT_HOST#http://}"
GIT_HOST="${GIT_HOST#https://}"
GIT_HOST="${GIT_HOST%%/*}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

################################################################################
# Functions
################################################################################

log() {
    echo -e "${GREEN}✓${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} ERROR: $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠${NC} WARNING: $1"
}

################################################################################
# Main Setup
################################################################################

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Git SSH Key Setup (Gitea/GitHub)${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Check if running as appropriate user
    if [[ "$SSH_USER" != "root" ]] && [[ "$SSH_USER" != "$(whoami)" ]]; then
        if [[ "$EUID" != 0 ]]; then
            error "Must run as sudo to configure SSH for other users"
        fi
    fi
    
    info "Setting up SSH for user: $SSH_USER"
    info "SSH home: $SSH_HOME"
    
    # Create .ssh directory if it doesn't exist
    if [ ! -d "$SSH_DIR" ]; then
        info "Creating $SSH_DIR..."
        mkdir -p "$SSH_DIR"
        chmod 700 "$SSH_DIR"
        if [[ "$SSH_USER" != "root" ]]; then
            chown "$SSH_USER:$SSH_USER" "$SSH_DIR"
        fi
        log "SSH directory created"
    else
        info "SSH directory already exists"
    fi
    
    # Generate SSH key if it doesn't exist
    if [ ! -f "$SSH_KEY_FILE" ]; then
        info "Generating new SSH key..."
        
        # Use a more portable method to run as the correct user
        if [[ "$SSH_USER" == "root" ]] || [[ "$EUID" != 0 ]]; then
            ssh-keygen -t ed25519 \
                -f "$SSH_KEY_FILE" \
                -N "" \
                -C "deploy-$(hostname)-$SSH_USER" \
                || error "Failed to generate SSH key"
        else
            sudo -u "$SSH_USER" ssh-keygen -t ed25519 \
                -f "$SSH_KEY_FILE" \
                -N "" \
                -C "deploy-$(hostname)-$SSH_USER" \
                || error "Failed to generate SSH key"
        fi
        
        chmod 600 "$SSH_KEY_FILE"
        chmod 644 "${SSH_KEY_FILE}.pub"
        
        log "SSH key generated: $SSH_KEY_FILE"
    else
        info "SSH key already exists: $SSH_KEY_FILE"
    fi
    
    # Create SSH config if it doesn't exist
    if [ ! -f "$SSH_CONFIG_FILE" ]; then
        info "Creating SSH config..."
        cat > "$SSH_CONFIG_FILE" <<EOF
# Git Server SSH Configuration
Host $GIT_HOST
    HostName $GIT_HOST
    User git
    IdentityFile %d/.ssh/id_ed25519_git
    AddKeysToAgent yes
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
        
        chmod 600 "$SSH_CONFIG_FILE"
        if [[ "$SSH_USER" != "root" ]]; then
            chown "$SSH_USER:$SSH_USER" "$SSH_CONFIG_FILE"
        fi
        
        log "SSH config created"
    else
        # Check if config for this host exists
        if ! grep -q "Host $GIT_HOST" "$SSH_CONFIG_FILE"; then
            warning "SSH config for $GIT_HOST not found in $SSH_CONFIG_FILE"
            info "Adding configuration..."
            cat >> "$SSH_CONFIG_FILE" <<EOF

# Git Server SSH Configuration
Host $GIT_HOST
    HostName $GIT_HOST
    User git
    IdentityFile %d/.ssh/id_ed25519_git
    AddKeysToAgent yes
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
            log "SSH config for $GIT_HOST added"
        else
            info "SSH config for $GIT_HOST already exists"
        fi
    fi
    
    # Display public key
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Your SSH Public Key${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    cat "${SSH_KEY_FILE}.pub"
    echo ""
    
    # Test SSH connection
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Testing SSH Connection to $GIT_HOST${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [[ "$SSH_USER" == "root" ]] || [[ "$EUID" != 0 ]]; then
        if ssh -T "git@$GIT_HOST" 2>&1 | grep -qE "successfully authenticated|PTY allocation request failed"; then
            log "SSH connection successful!"
        else
            warning "Could not verify connection to $GIT_HOST"
            info "Add the public key above to your Git server account."
            info "Then run: ssh -T git@$GIT_HOST"
        fi
    else
        sudo -u "$SSH_USER" ssh -T "git@$GIT_HOST" 2>&1 | grep -qE "successfully authenticated|PTY allocation request failed" && \
            log "SSH connection successful!" || \
            warning "Could not verify connection to $GIT_HOST"
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}SSH Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy the public key above"
    echo "2. Add it to your Git server (Gitea Settings -> SSH / GPG Keys)"
    echo "3. Update your environment with your repository SSH URL:"
    echo "   export REPO_URL='git@$GIT_HOST:username/Aidan-Calculator.git'"
    echo "4. Run: sudo $SSH_USER -c '/path/to/deploy.sh'"
    echo ""
}

# Print usage
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    cat <<EOF
GitHub SSH Key Setup Script

Usage: sudo $0 [--user USERNAME]

Options:
  --user USERNAME    Setup SSH for specific user (default: root)
  -h, --help        Show this help message

Examples:
  # Setup SSH for root user
  sudo GIT_HOST="gitea.example.com" $0

  # Setup SSH for www-data user (Nginx)
  sudo $0 --user www-data

  # Setup SSH for www user (Apache)
  sudo $0 --user www

Notes:
  - Run with sudo for system users (www-data, www, etc.)
  - Public key will be displayed - add it to GitHub settings
  - GIT_HOST should be a domain or IP, NOT a URL starting with http://

EOF
    exit 0
fi

# Run main
main "$@"
