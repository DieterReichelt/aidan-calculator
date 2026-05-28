#!/bin/bash

################################################################################
# Aidan's Math Notebook - Deployment Script
# Purpose: Deploy from Gitea to production server
# Usage: ./deploy.sh
################################################################################

set -e  # Exit on error

# Configuration
REPO_URL="${REPO_URL:-gitea@gitea.reichelt.org.za:Dieter/aidan-calculator.git}"
REPO_DIR="${REPO_DIR:-/opt/aidan-calculator}"
BUILD_DIR="${REPO_DIR}/dist"
WEB_ROOT="${WEB_ROOT:-/var/www/aidan-calculator}"
LOG_FILE="/var/log/aidan-calculator-deploy.log"
BRANCH="${BRANCH:-main}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

################################################################################
# Functions
################################################################################

log() {
    # Create log file if it doesn't exist and ensure it's writable
    [ ! -f "$LOG_FILE" ] && touch "$LOG_FILE" 2>/dev/null || true
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE" 2>/dev/null || echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE" 2>/dev/null || echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

check_requirements() {
    log "Checking system requirements..."
    
    command -v git &> /dev/null || error "git is not installed"
    command -v node &> /dev/null || error "Node.js is not installed"
    command -v npm &> /dev/null || error "npm is not installed"
    
    log "✓ All requirements met (git, Node.js, npm)"
    
    # Check SSH key for Git server access
    if [[ "$REPO_URL" =~ ^git@ ]]; then
        # Extract host from REPO_URL (e.g., github.com or your Gitea IP)
        local git_host=$(echo "$REPO_URL" | sed -e 's/git@//' -e 's/:.*//')
        local identity_file="$HOME/.ssh/id_ed25519_gitea"
        
        log "Checking SSH access to $git_host..."
        
        # Test connection explicitly using the generated identity file if it exists
        if ! ssh -i "$identity_file" -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$git_host" 2>&1 | grep -qE "successfully authenticated|PTY allocation request failed"; then
            warning "SSH key not configured or connection to $git_host failed"
            warning "Set up SSH key or switch to HTTPS:"
            local https_url=$(echo "$REPO_URL" | sed -e 's/:/\//' -e 's/git@/https:\/\//')
            warning "  export REPO_URL='$https_url'"
        else
            log "✓ Git server SSH access verified"
        fi
    fi
}

setup_directories() {
    log "Setting up directories..."
    
    if [ ! -d "$REPO_DIR" ]; then
        log "Cloning repository from $REPO_URL..."
        git clone -b "$BRANCH" "$REPO_URL" "$REPO_DIR" || error "Failed to clone repository"
    else
        log "Repository already exists at $REPO_DIR"
    fi
    
    mkdir -p "$WEB_ROOT" || error "Failed to create web root directory"
    log "✓ Directories ready"
}

update_repository() {
    log "Updating repository..."
    cd "$REPO_DIR"
    
    git fetch origin || error "Failed to fetch from origin"
    git checkout "$BRANCH" || error "Failed to checkout $BRANCH"
    git pull origin "$BRANCH" || error "Failed to pull from origin"
    
    log "✓ Repository updated to latest $BRANCH"
}

install_dependencies() {
    log "Installing npm dependencies..."
    cd "$REPO_DIR"
    
    # Ensure devDependencies (like Vite) are installed for the build process
    npm ci --include=dev || error "Failed to install dependencies"
    log "✓ Dependencies installed"
}

build_project() {
    log "Building project..."
    cd "$REPO_DIR"
    
    ./node_modules/.bin/vite build || error "Build failed"
    
    if [ ! -d "$BUILD_DIR" ]; then
        error "Build directory not found at $BUILD_DIR"
    fi
    
    log "✓ Build completed successfully"
}

deploy_files() {
    log "Deploying files to $WEB_ROOT..."
    
    # Backup current deployment (optional)
    if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT)" ]; then
        BACKUP_DIR="${WEB_ROOT}.backup.$(date +%s)"
        log "Backing up current deployment to $BACKUP_DIR"
        cp -r "$WEB_ROOT" "$BACKUP_DIR" || warning "Backup failed but continuing deployment"
    fi
    
    # Copy build files
    rm -rf "$WEB_ROOT"/* 2>/dev/null || true
    cp -r "$BUILD_DIR"/* "$WEB_ROOT/" || error "Failed to copy build files"
    
    log "✓ Files deployed to $WEB_ROOT"
}

set_permissions() {
    log "Setting permissions..."
    
    # Determine web server user (nginx or apache2)
    if id "www-data" &>/dev/null 2>&1; then
        WEB_USER="www-data"
    elif id "nginx" &>/dev/null 2>&1; then
        WEB_USER="nginx"
    else
        WEB_USER="www-data"
        warning "Could not determine web server user, defaulting to www-data"
    fi
    
    chown -R "$WEB_USER:$WEB_USER" "$WEB_ROOT" || error "Failed to set ownership"
    chmod -R 755 "$WEB_ROOT" || error "Failed to set directory permissions"
    chmod -R 644 "$WEB_ROOT"/* || error "Failed to set file permissions"
    
    log "✓ Permissions set (owner: $WEB_USER)"
}

restart_web_server() {
    log "Restarting web server..."
    
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx || warning "Failed to reload nginx"
        log "✓ nginx reloaded"
    elif systemctl is-active --quiet apache2; then
        systemctl reload apache2 || warning "Failed to reload apache2"
        log "✓ apache2 reloaded"
    else
        warning "No web server (nginx/apache2) detected or running"
    fi
}

verify_deployment() {
    log "Verifying deployment..."
    
    if [ ! -f "$WEB_ROOT/index.html" ]; then
        error "Deployment verification failed: index.html not found"
    fi
    
    log "✓ Deployment verification passed"
}

################################################################################
# Main Deployment Process
################################################################################

main() {
    log "=========================================="
    log "Starting Aidan's Calculator Deployment"
    log "=========================================="
    
    # Ensure we are in the script directory to resolve relative paths for setup-ssh.sh
    cd "$(dirname "$0")"

    check_requirements
    setup_directories
    update_repository
    install_dependencies
    build_project
    deploy_files
    set_permissions
    restart_web_server
    verify_deployment
    
    log "=========================================="
    log "✓ Deployment completed successfully!"
    log "=========================================="
    log "Application URL: http://$(hostname -I | awk '{print $1}')/aidans-calculator"
    log "Web root: $WEB_ROOT"
    log "Log file: $LOG_FILE"
}

# Run main function
main "$@"
