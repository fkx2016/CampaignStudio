# Tools Directory

This directory contains utility scripts for managing the Campaign Studio database and API.

## Database Management Scripts

### `check_data.py`
**Purpose:** Inspect database contents and verify data integrity.

**Usage:**
```bash
python tools/check_data.py
```

**What it does:**
- Connects to local PostgreSQL database
- Counts platforms, campaigns, and posts
- Shows sample data from each table

---

### `wipe_local_db.py`
**Purpose:** ⚠️ **DESTRUCTIVE** - Drops all tables in local database.

**Usage:**
```bash
python tools/wipe_local_db.py
```

**What it does:**
- Connects to `localhost:5432/campaignstudio`
- Drops all tables using SQLAlchemy metadata reflection
- Requires backend restart to rebuild tables

**⚠️ WARNING:** This will delete ALL local data. Use only for development resets.

---

### `wipe_prod_db.py`
**Purpose:** ⚠️ **EXTREMELY DESTRUCTIVE** - Drops all tables in production database.

**Usage:**
```bash
python tools/wipe_prod_db.py
```

**What it does:**
- Connects to Railway production database
- Drops all tables
- Requires Railway backend restart to rebuild

**🚨 DANGER:** This will delete ALL production data. Use with extreme caution!

---

### `restore_campaign.py`
**Purpose:** Restore original campaign posts from `titles_and_hooks.json`.

**Usage:**
```bash
python tools/restore_campaign.py
```

**What it does:**
- Loads posts from `titles_and_hooks.json` (in project root)
- Creates "Original Donation Drive" campaign under "ebeg" mode
- Imports all posts into that campaign
- Skips duplicates (checks by title)
- Fixes PostgreSQL sequence counter

**Requirements:**
- `titles_and_hooks.json` must exist in project root
- Database must have "ebeg" mode seeded

---

### `create_superuser.py`
**Purpose:** Manually create a superuser account.

**Usage:**
```bash
python tools/create_superuser.py
```

**What it does:**
- Prompts for email, password, and full name
- Creates user with `is_superuser=True`
- Hashes password with bcrypt

**Note:** `fkurka@gmail.com` is auto-admin on registration via the API.

---

## API Testing Scripts

### `verify_api.py`
**Purpose:** Health check for local API endpoints.

**Usage:**
```bash
python tools/verify_api.py
```

**What it does:**
- Checks `/health` endpoint
- Lists posts from `/api/posts`
- Lists campaigns from `/api/campaigns`
- Shows sample data

**Default URL:** `http://localhost:8001`

---

## Other Scripts

### `check_campaigns.py`
**Purpose:** Inspect campaign data.

### `check_posts.py`
**Purpose:** Inspect post data.

### `add_tech_platforms_simple.py`
**Purpose:** Add additional tech platforms to database.

---

## Running Scripts from Tools Directory

All scripts have been updated to work from the `tools/` directory. They use:

```python
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Now can import from backend
from backend.models import ...
```

---

## Environment Requirements

**Python Dependencies:**
- `sqlmodel`
- `sqlalchemy`
- `requests`
- `passlib`
- `python-jose`

**Database:**
- Local: `postgresql://postgres:postgres@localhost:5432/campaignstudio`
- Production: Railway PostgreSQL (see `.env` for credentials)

---

## Safety Checklist

Before running destructive scripts:

- [ ] **Backup database** (if production)
- [ ] **Verify target database** (local vs production)
- [ ] **Confirm you want to delete data**
- [ ] **Have recovery plan** (backups, restore scripts)

---

**Last Updated:** 2025-12-07  
**Maintained By:** Campaign Studio Development Team
