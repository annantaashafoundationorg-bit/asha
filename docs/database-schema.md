# Database Schema

## PostgreSQL tables (production)

### books
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | TEXT | |
| grade | TEXT | |
| subject | TEXT | |
| language | TEXT | default 'en' |
| centre_id | TEXT | |
| created_at | TIMESTAMPTZ | |

### tln_nodes
| Column | Type | Notes |
|--------|------|-------|
| node_id | TEXT PK | e.g. tln-001 |
| book_id | UUID FK | → books.id |
| title | TEXT | |
| concept | TEXT | |
| grade | TEXT | |
| subject | TEXT | |
| language | TEXT | |
| asset_ids | TEXT[] | |
| memory_tags | TEXT[] | |
| created_at | TIMESTAMPTZ | |

### learning_sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | TEXT | |
| node_id | TEXT FK | → tln_nodes.node_id |
| level | TEXT | |
| sequence | TEXT[] | |
| completed_at | TIMESTAMPTZ | |

### assessment_results
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | TEXT | |
| node_id | TEXT FK | |
| score | INT | |
| passed | BOOLEAN | |
| weakness_tags | TEXT[] | |
| coins_awarded | INT | |
| xp_awarded | INT | |
| created_at | TIMESTAMPTZ | |

### asset_registry
| Column | Type | Notes |
|--------|------|-------|
| asset_id | TEXT PK | |
| title | TEXT | |
| asset_type | TEXT | svg/lottie/simulation/image |
| tags | TEXT[] | |
| subject | TEXT | |
| source | TEXT | reusable/generated |
| url | TEXT | |
| created_at | TIMESTAMPTZ | |

### verification_records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | TEXT | |
| node_id | TEXT | |
| score | INT | |
| verified_by | TEXT | |
| verified_at | TIMESTAMPTZ | |
