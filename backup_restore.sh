#!/bin/bash

# Enhanced Backup/Restore Script for ResourceSheet
# This script provides robust backup and restore functionality

set -e  # Exit on any error

# Configuration
DB_HOST="localhost"
DB_PORT="54322"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if psql is available
check_psql() {
    if ! command -v psql &> /dev/null; then
        error "psql command not found. Please install PostgreSQL client."
        echo "You can install it with: sudo apt install postgresql-client"
        return 1
    fi
    return 0
}

# Function to check database connection
check_db_connection() {
    log "Checking database connection..."
    
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        error "Cannot connect to database. Please check:"
        error "  - Database is running"
        error "  - Connection parameters are correct"
        error "  - Database user has proper permissions"
        return 1
    fi
    
    success "Database connection successful"
    return 0
}

# Function to create full backup
create_full_backup() {
    local backup_name="$1"
    
    if [ -z "$backup_name" ]; then
        backup_name="database_backup_$(date +%Y-%m-%d_%H-%M-%S).sql"
    fi
    
    log "Creating full database backup: $backup_name"
    
    # Check if backup file already exists
    if [ -f "$backup_name" ]; then
        warning "Backup file already exists: $backup_name"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Backup cancelled"
            return 1
        fi
    fi
    
    # Create backup with compression
    log "Starting backup process..."
    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --compress=9 \
        -f "$backup_name"; then
        
        # Check if backup was created successfully
        if [ -f "$backup_name" ]; then
            local size=$(du -h "$backup_name" | cut -f1)
            success "Backup created successfully: $backup_name ($size)"
            
            # Validate backup file
            if PGPASSWORD="$DB_PASSWORD" pg_restore --list "$backup_name" &> /dev/null; then
                success "Backup file validation passed"
            else
                error "Backup file validation failed"
                return 1
            fi
        else
            error "Backup file was not created"
            return 1
        fi
    else
        error "Backup creation failed"
        return 1
    fi
}

# Function to restore from backup
restore_from_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "No backup file specified"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    log "Validating backup file: $backup_file"
    
    # Validate backup file
    if ! PGPASSWORD="$DB_PASSWORD" pg_restore --list "$backup_file" &> /dev/null; then
        error "Invalid backup file: $backup_file"
        return 1
    fi
    
    local size=$(du -h "$backup_file" | cut -f1)
    log "Backup file: $backup_file ($size)"
    
    # Show warning about data loss
    warning "WARNING: This will completely overwrite your current database!"
    warning "All existing data will be lost and cannot be recovered."
    echo
    
    # Show backup contents summary
    log "Backup contents summary:"
    PGPASSWORD="$DB_PASSWORD" pg_restore --list "$backup_file" | grep -E "(TABLE|SEQUENCE|INDEX)" | wc -l | xargs echo "  Tables/Sequences/Indexes:"
    PGPASSWORD="$DB_PASSWORD" pg_restore --list "$backup_file" | grep -E "TABLE DATA" | wc -l | xargs echo "  Data entries:"
    echo
    
    # Confirm restore
    read -p "Are you sure you want to proceed? This action cannot be undone. (type 'yes' to confirm): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        error "Restore cancelled"
        return 1
    fi
    
    log "Creating safety backup before restore..."
    local safety_backup="safety_backup_$(date +%Y-%m-%d_%H-%M-%S).sql"
    if ! PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        -f "$safety_backup"; then
        error "Failed to create safety backup"
        return 1
    fi
    success "Safety backup created: $safety_backup"
    
    log "Starting restore process..."
    
    # Drop and recreate database
    log "Dropping existing database objects..."
    if ! PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; then
        error "Failed to drop existing database objects"
        return 1
    fi
    
    # Restore from backup
    if PGPASSWORD="$DB_PASSWORD" pg_restore \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        "$backup_file"; then
        
        success "Database restored successfully from: $backup_file"
        
        # Verify restore
        log "Verifying restore..."
        local table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        log "Tables in database after restore: $table_count"
        
        success "Restore verification completed"
    else
        error "Restore failed"
        return 1
    fi
}

# Function to list available backups
list_backups() {
    log "Available backup files:"
    echo
    
    # Find all backup files
    local backup_files=($(find . -maxdepth 1 -name "database_backup_*.sql" -o -name "safety_backup_*.sql" 2>/dev/null | sort -r))
    
    if [ ${#backup_files[@]} -eq 0 ]; then
        warning "No backup files found"
        return 0
    fi
    
    for file in "${backup_files[@]}"; do
        if [ -f "$file" ]; then
            local size=$(du -h "$file" | cut -f1)
            local date=$(stat -c %y "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
            printf "  %-50s %8s  %s\n" "$file" "$size" "$date"
        fi
    done
    echo
}

# Function to show help
show_help() {
    echo "ResourceSheet Database Backup/Restore Tool"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  backup [filename]     Create a full database backup"
    echo "  restore <file>        Restore database from backup file"
    echo "  list                  List available backup files"
    echo "  help                  Show this help message"
    echo
    echo "Examples:"
    echo "  $0 backup                                    # Create backup with timestamp"
    echo "  $0 backup my_backup.sql                      # Create backup with custom name"
    echo "  $0 restore database_backup_2026-02-03.sql    # Restore from specific file"
    echo "  $0 list                                      # List all backup files"
    echo
    echo "Environment Variables:"
    echo "  DB_HOST     Database host (default: localhost)"
    echo "  DB_PORT     Database port (default: 54322)"
    echo "  DB_NAME     Database name (default: postgres)"
    echo "  DB_USER     Database user (default: postgres)"
    echo "  DB_PASSWORD Database password (default: postgres)"
    echo
}

# Main script logic
main() {
    case "${1:-help}" in
        "backup")
            if ! check_psql; then exit 1; fi
            if ! check_db_connection; then exit 1; fi
            create_full_backup "$2"
            ;;
        "restore")
            if ! check_psql; then exit 1; fi
            if ! check_db_connection; then exit 1; fi
            restore_from_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"