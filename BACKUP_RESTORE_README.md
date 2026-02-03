# Database Backup & Restore Guide

## Overview

This document provides instructions for using the enhanced backup and restore functionality for the ResourceSheet application.

## Quick Start

### Creating a Backup

```bash
# Create backup with timestamp
./backup_restore.sh backup

# Create backup with custom name
./backup_restore.sh backup my_backup.sql
```

### Restoring from Backup

```bash
# List available backups
./backup_restore.sh list

# Restore from specific file
./backup_restore.sh restore database_backup_2026-02-03_11-47-00.sql
```

### Listing Available Backups

```bash
./backup_restore.sh list
```

## Features

### ✅ Full Database Backup
- Complete SQL dump of all tables and data
- Includes schema, data, indexes, and constraints
- Compressed backup files for efficient storage
- Automatic timestamp-based naming

### ✅ Robust Restore
- Complete database restore from backup
- Backup file validation before restore
- Safety backup creation before restore operations
- Comprehensive error handling and rollback

### ✅ Safety Features
- Database connection validation
- Backup file integrity checks
- Safety backup creation before restore
- Clear warnings about data loss
- Confirmation prompts for destructive operations

### ✅ User-Friendly Interface
- Color-coded output for better readability
- Progress logging with timestamps
- Clear error messages and guidance
- Backup file size and content summary

## Command Reference

### backup [filename]
Creates a full database backup.

**Options:**
- `filename` (optional): Custom backup file name. If not provided, uses timestamp.

**Example:**
```bash
./backup_restore.sh backup                    # Creates: database_backup_2026-02-03_11-47-00.sql
./backup_restore.sh backup my_data.sql        # Creates: my_data.sql
```

### restore <file>
Restores database from a backup file.

**Options:**
- `file`: Required. Path to the backup file to restore from.

**Example:**
```bash
./backup_restore.sh restore database_backup_2026-02-03_11-47-00.sql
```

### list
Lists all available backup files.

**Example:**
```bash
./backup_restore.sh list
```

### help
Shows help information and usage examples.

**Example:**
```bash
./backup_restore.sh help
```

## Environment Variables

You can customize the database connection by setting these environment variables:

```bash
export DB_HOST="your_host"
export DB_PORT="your_port"
export DB_NAME="your_database"
export DB_USER="your_username"
export DB_PASSWORD="your_password"
```

**Default Values:**
- `DB_HOST`: localhost
- `DB_PORT`: 54322
- `DB_NAME`: postgres
- `DB_USER`: postgres
- `DB_PASSWORD`: postgres

## Prerequisites

### Required Software
- PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`)
- Install with: `sudo apt install postgresql-client`

### Database Access
- Database must be running and accessible
- User must have appropriate permissions for backup/restore operations
- Network connectivity to database server

## Backup File Format

### File Naming Convention
- **Automatic**: `database_backup_YYYY-MM-DD_HH-MM-SS.sql`
- **Custom**: Any name you specify

### File Contents
- Complete database schema (tables, indexes, constraints)
- All data from all tables
- Database objects and permissions
- Custom format with compression for smaller file sizes

### File Validation
- Automatic validation after creation
- Integrity checks before restore
- Content summary display

## Restore Process

### Safety Measures
1. **Backup Validation**: Checks if backup file is valid and readable
2. **Safety Backup**: Creates backup of current database before restore
3. **Confirmation**: Requires explicit confirmation for destructive operations
4. **Rollback**: Automatic rollback if restore fails

### Restore Steps
1. Validate backup file integrity
2. Create safety backup of current database
3. Drop existing database objects
4. Restore from backup file
5. Verify restore completion
6. Display summary of restored data

### Warnings
- **Data Loss**: Restore completely overwrites current database
- **Irreversible**: This operation cannot be undone
- **Confirmation Required**: Must type 'yes' to confirm restore

## Troubleshooting

### Common Issues

#### "psql command not found"
**Solution**: Install PostgreSQL client
```bash
sudo apt install postgresql-client
```

#### "Cannot connect to database"
**Check**:
- Database server is running
- Connection parameters are correct
- User has proper permissions
- Network connectivity is available

#### "Backup file validation failed"
**Check**:
- Backup file exists and is readable
- File is not corrupted
- File was created with compatible PostgreSQL version

#### "Restore failed"
**Check**:
- Database connection is stable
- User has sufficient permissions
- No other processes are using the database
- Safety backup was created successfully

### Error Recovery

#### Backup Creation Failed
- Check database connection
- Verify user permissions
- Ensure sufficient disk space
- Check PostgreSQL server logs

#### Restore Failed
- Check safety backup was created
- Verify backup file integrity
- Ensure database is not in use
- Check PostgreSQL server logs

## Best Practices

### Backup Strategy
1. **Regular Backups**: Schedule regular backups during low-usage periods
2. **Multiple Copies**: Keep backups in multiple locations
3. **Test Restores**: Periodically test restore operations
4. **Version Compatibility**: Ensure backup/restore tools are compatible

### Security
1. **File Permissions**: Set appropriate file permissions on backup files
2. **Access Control**: Limit access to backup/restore operations
3. **Encryption**: Consider encrypting sensitive backup files
4. **Audit Logging**: Log all backup/restore operations

### Maintenance
1. **Cleanup Old Backups**: Remove old backup files to save space
2. **Monitor Disk Space**: Ensure sufficient space for backup operations
3. **Update Scripts**: Keep backup scripts updated with database changes
4. **Documentation**: Maintain up-to-date documentation

## Examples

### Daily Backup Script
```bash
#!/bin/bash
# daily_backup.sh

./backup_restore.sh backup daily_backup_$(date +%Y-%m-%d).sql
echo "Daily backup completed: $(date)"
```

### Automated Restore Test
```bash
#!/bin/bash
# test_restore.sh

# List available backups
./backup_restore.sh list

# Test restore (use with caution!)
# ./backup_restore.sh restore test_backup.sql
```

### Environment-Specific Configuration
```bash
# production_backup.sh
export DB_HOST="prod-db.example.com"
export DB_PORT="5432"
export DB_NAME="production"
export DB_USER="backup_user"
export DB_PASSWORD="secure_password"

./backup_restore.sh backup production_$(date +%Y-%m-%d).sql
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review PostgreSQL server logs
3. Verify database connectivity and permissions
4. Ensure all prerequisites are met

## Future Enhancements

Planned improvements include:
- Web interface for backup/restore operations
- Automated backup scheduling
- Cloud storage integration
- Incremental backup support
- Parallel backup/restore operations