# ⚙️ Rating System Configurations

This directory contains the **official and experimental** rating configurations for the Riichi Mahjong League.

🎯 **Status**: **Active** - 3 configurations loaded in database  
🔧 **Management**: Use `config_manager.py` for loading and validation

## Structure

```
configs/
├── README.md                 # This file
├── season-3.yaml            # Season 3 configuration (Feb 2022 - Jul 2025)
├── season-4.yaml            # Season 4 configuration (Aug 2025+)
└── experimental/            # Non-official configurations for testing
    ├── high-stakes.yaml
    └── beginner-friendly.yaml
```

## Usage

Configurations are stored as YAML files for human readability and version control, then loaded into the database via migration scripts.

### Adding a New Season

1. Create `season-X.yaml` with the configuration
2. Create a migration script to load it into the database
3. Mark as official in the database

### Configuration Format

See `season-3.yaml` for the canonical example following the TypeScript interface in `docs/05-rating-system.md`.

## Migration Strategy

- **Source of Truth**: YAML files in this directory
- **Runtime Storage**: Database for fast access and caching
- **Version Control**: All configuration changes tracked in git
- **Validation**: Schema validation before database insertion
