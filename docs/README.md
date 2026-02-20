# F1 Resource Manager - Documentation Index

This directory contains all documentation for the F1 Resource Manager project, organized by category.

## Quick Links

| Category | Description | Key Documents |
|----------|-------------|---------------|
| [API](./api/) | API documentation | [API Reference](./api/API.md) |
| [Architecture](./architecture/) | System architecture and design | [Architecture Overview](./architecture/ARCHITECTURE.md) |
| [Deployment](./deployment/) | Hosting and deployment guides | [Self-Hosting](./deployment/SELF_HOSTING.md), [Vercel](./deployment/VERCEL_HOSTING.md) |
| [Development](./development/) | Setup and development guides | [Setup Guide](./development/SETUP.md), [Migration Guide](./development/MIGRATION_GUIDE.md), [Component Decomposition Plan](./development/COMPONENT_DECOMPOSITION_PLAN.md) |
| [Operations](./operations/) | Backup, restore, and maintenance | [Backup & Restore](./operations/BACKUP_RESTORE_PLAN.md) |
| [Product](./product/) | Product design and vision | [Product Design](./product/ProductDesign.md) |
| [Archive](./archive/) | Historical documentation | Past reviews and analyses |

## Directory Structure

```
docs/
├── api/                    # API documentation
│   └── API.md             # Complete API reference
├── architecture/           # System architecture
│   ├── ARCHITECTURE.md    # Architecture overview
│   └── GeneralArchitechtureDesign.md  # Design principles
├── deployment/             # Deployment guides
│   ├── SELF_HOSTING.md    # Self-hosting instructions
│   └── VERCEL_HOSTING.md  # Vercel deployment guide
├── development/            # Development setup
│   ├── SETUP.md           # Comprehensive setup guide (consolidated)
│   └── MIGRATION_GUIDE.md # Database migration procedures
├── operations/             # Operations & maintenance
│   ├── BACKUP_RESTORE_PLAN.md    # Backup strategy
│   ├── BACKUP_RESTORE_README.md  # Backup overview
│   ├── BACKUP_INSTRUCTIONS.md    # Step-by-step backup
│   ├── CURRENT_SEASON_MANAGEMENT.md  # Season management
│   └── WIPE_AND_REPOPULATE_GUIDE.md  # Data operations
├── product/                # Product documentation
│   └── ProductDesign.md   # Product vision and UX
├── archive/                # Historical documents
│   ├── CODE_REVIEW_2026-02-09.md  # Previous code review
│   ├── REFACTORING_SUMMARY.md     # Refactoring notes
│   └── ...                         # Other archived docs
└── CODE_REVIEW_2026-02-20.md  # Latest code review
```

## For New Developers

1. Start with the [Setup Guide](./development/SETUP.md)
2. Read the [Architecture Overview](./architecture/ARCHITECTURE.md)
3. Review the [API Documentation](./api/API.md)
4. Check the [Product Design](./product/ProductDesign.md) for context

## For Operations

1. [Backup & Restore Plan](./operations/BACKUP_RESTORE_PLAN.md)
2. [Current Season Management](./operations/CURRENT_SEASON_MANAGEMENT.md)
3. [Self-Hosting Guide](./deployment/SELF_HOSTING.md)

## Historical Documents

The [archive/](./archive/) directory contains documents from previous development phases. These are kept for historical reference but may contain outdated information.

---

**Last Updated:** February 20, 2026