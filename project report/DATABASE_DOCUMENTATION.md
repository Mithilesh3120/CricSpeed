# CricSpeed AI: Database Architecture & Data Dictionary

## 1. Dual-Database Design Philosophy

CricSpeed AI employs a hybrid dual-database architecture tailored to two distinct operational profiles:

```
                            +-----------------------------------+
                            |         Flask API Backend         |
                            +-----------------+-----------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
                   v                                                     v
      [ SQLite: scorecard.db ]                              [ MongoDB: cricspeed ]
  - Relational & ACID Compliant                         - High-Throughput Document Store
  - Thread-Safe (timeout = 20.0s)                       - Non-blocking Append-Only
  - Cricket Match Engine & Scorecards                   - Real-time Speed Radar Log
  - Multi-table schema with foreign keys               - Single collection: 'runs'
```

1. **Relational Match & Scorecard Store (SQLite 3 - `database/scorecard.db`)**:
   - Manages complex state transitions, overs, strike rotation, innings completion, and ball-by-ball delivery analytics.
   - Requires ACID compliance so that score updates, maiden calculations, and undo operations remain strictly consistent.
   - Built-in thread safety with `sqlite3.connect(DB_PATH, timeout=20.0)` and `conn.row_factory = sqlite3.Row`.

2. **Time-Series Speed Radar Store (MongoDB - `cricspeed`)**:
   - High-throughput, low-latency document logging for continuous speed tracking runs.
   - Independent collection (`runs`) indexed by descending sequence ID for rapid pagination without interfering with relational match transactions.

---

## 2. SQLite Database Schema (`database/scorecard.db`)

### 2.1 Table: `matches`

Stores high-level match metadata, game state, toss details, innings progression, and match outcome.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique match identifier |
| `team1` | `TEXT` | `NOT NULL` | - | Name of First Team |
| `team2` | `TEXT` | `NOT NULL` | - | Name of Second Team |
| `total_overs` | `INTEGER` | `NOT NULL` | - | Scheduled overs per innings |
| `toss_winner` | `TEXT` | `NULLABLE` | `NULL` | Name of team winning toss |
| `toss_decision` | `TEXT` | `NULLABLE` | `NULL` | 'BAT' or 'BOWL' |
| `current_innings` | `INTEGER`| `DEFAULT 1` | `1` | Active innings (1 or 2) |
| `target` | `INTEGER` | `DEFAULT 0` | `0` | Target score for 2nd innings |
| `status` | `TEXT` | `DEFAULT 'LIVE'` | `'LIVE'` | Match state ('LIVE', 'COMPLETED', 'ABANDONED') |
| `winner` | `TEXT` | `DEFAULT ''` | `''` | Result declaration string |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP` | Match creation timestamp |

---

### 2.2 Table: `batting_scorecard`

Tracks individual batter statistics for each match and innings.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique batting record ID |
| `match_id` | `INTEGER` | `NOT NULL, FK -> matches(id)` | - | Reference to parent match |
| `innings_no` | `INTEGER` | `NOT NULL` | - | Innings number (1 or 2) |
| `player` | `TEXT` | `NOT NULL` | - | Name of the batsman |
| `runs` | `INTEGER` | `DEFAULT 0` | `0` | Runs scored off the bat |
| `balls` | `INTEGER` | `DEFAULT 0` | `0` | Legal deliveries faced |
| `fours` | `INTEGER` | `DEFAULT 0` | `0` | Boundary 4s hit |
| `sixes` | `INTEGER` | `DEFAULT 0` | `0` | Boundary 6s hit |
| `out_desc` | `TEXT` | `DEFAULT 'not out'` | `'not out'` | Dismissal description (e.g. 'b Bowler', 'not out') |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP` | Record update timestamp |

**Indexes & Constraints:**
- `UNIQUE(match_id, innings_no, player)`: Prevents duplicate records for the same batter within an innings.

---

### 2.3 Table: `bowling_scorecard`

Maintains bowling figures for each bowler per innings.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique bowling record ID |
| `match_id` | `INTEGER` | `NOT NULL, FK -> matches(id)` | - | Reference to parent match |
| `innings_no` | `INTEGER` | `NOT NULL` | - | Innings number (1 or 2) |
| `bowler` | `TEXT` | `NOT NULL` | - | Name of the bowler |
| `balls` | `INTEGER` | `DEFAULT 0` | `0` | Legal deliveries bowled |
| `maidens` | `INTEGER` | `DEFAULT 0` | `0` | Completed maiden overs |
| `runs` | `INTEGER` | `DEFAULT 0` | `0` | Runs conceded by bowler |
| `wickets` | `INTEGER` | `DEFAULT 0` | `0` | Wickets credited to bowler |
| `max_speed` | `REAL` | `DEFAULT 0.0` | `0.0` | Peak delivery speed recorded (km/h) |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP` | Record update timestamp |

**Indexes & Constraints:**
- `UNIQUE(match_id, innings_no, bowler)`: Prevents duplicate records for the same bowler within an innings.

---

### 2.4 Table: `ball_by_ball`

Comprehensive log of every delivery in the match, with 11 delivery movement analysis fields.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique ball record ID |
| `match_id` | `INTEGER` | `NOT NULL, FK -> matches(id)` | - | Reference to parent match |
| `innings_no` | `INTEGER` | `NOT NULL` | - | Innings number (1 or 2) |
| `over_no` | `INTEGER` | `NOT NULL` | - | Over number (0-indexed or 1-indexed) |
| `ball_no` | `INTEGER` | `NOT NULL` | - | Legal ball count within the over |
| `batsman` | `TEXT` | `NOT NULL` | - | Striker facing delivery |
| `bowler` | `TEXT` | `NOT NULL` | - | Active bowler |
| `runs` | `INTEGER` | `DEFAULT 0` | `0` | Runs scored on this ball |
| `extra_type` | `TEXT` | `NULLABLE` | `NULL` | 'wide', 'no_ball', 'bye', 'leg_bye' |
| `wicket` | `TEXT` | `NULLABLE` | `NULL` | Wicket description or 'bowled', 'caught' |
| `speed_kmh` | `REAL` | `DEFAULT 0.0` | `0.0` | Measured ball speed (km/h) |
| `delivery_type`| `TEXT` | `NULLABLE` | `NULL` | 'OFF_SPIN', 'LEG_SPIN', 'INSWING', 'OUTSWING', 'STRAIGHT' |
| `spin_type` | `TEXT` | `NULLABLE` | `NULL` | 'OFF_BREAK', 'LEG_BREAK', 'NONE' |
| `swing_type` | `TEXT` | `NULLABLE` | `NULL` | 'INSWING', 'OUTSWING', 'NONE' |
| `turn_angle_deg`| `REAL` | `NULLABLE` | `NULL` | Trajectory turn angle at bounce in degrees |
| `swing_cm` | `REAL` | `NULLABLE` | `NULL` | Maximum lateral flight deviation in centimeters |
| `bounce_x` | `REAL` | `NULLABLE` | `NULL` | Pitch lateral bounce position (metres or normalized) |
| `bounce_y` | `REAL` | `NULLABLE` | `NULL` | Pitch longitudinal bounce distance from stumps (m) |
| `length` | `TEXT` | `NULLABLE` | `NULL` | 'YORKER', 'FULL', 'GOOD_LENGTH', 'SHORT' |
| `line` | `TEXT` | `NULLABLE` | `NULL` | 'OUTSIDE_OFF', 'OFF_STUMP', 'MIDDLE', 'LEG_STUMP', 'OUTSIDE_LEG' |
| `analysis_confidence` | `REAL` | `NULLABLE` | `NULL` | Model confidence score (0.00 to 1.00) |
| `analysis_json` | `TEXT` | `NULLABLE` | `NULL` | Full JSON serialized analysis payload |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP` | Ball timestamp |

---

## 3. Idempotent Schema Migration Logic

To ensure smooth schema evolution without table drops or loss of historical matches, `database/scorecard_db.py` uses dynamic schema introspection on startup:

```python
# Idempotent migration: Add delivery analysis columns if missing
cursor.execute("PRAGMA table_info(ball_by_ball)")
existing_cols = {row["name"] for row in cursor.fetchall()}

analysis_columns = [
    ("delivery_type", "TEXT"),
    ("spin_type", "TEXT"),
    ("swing_type", "TEXT"),
    ("turn_angle_deg", "REAL"),
    ("swing_cm", "REAL"),
    ("bounce_x", "REAL"),
    ("bounce_y", "REAL"),
    ("length", "TEXT"),
    ("line", "TEXT"),
    ("analysis_confidence", "REAL"),
    ("analysis_json", "TEXT")
]
for col_name, col_type in analysis_columns:
    if col_name not in existing_cols:
        cursor.execute(f"ALTER TABLE ball_by_ball ADD COLUMN {col_name} {col_type} DEFAULT NULL")
conn.commit()
```

---

## 4. MongoDB Database Schema (`cricspeed.runs`)

The MongoDB database logs speed radar runs.

### 4.1 Collection: `runs`

```json
{
  "_id": ObjectId("6624e5a9c8e1a7b42d3e1001"),
  "id": 42,
  "speed": 118.4,
  "status": "NORMAL",
  "timestamp": "2026-10-21 20:30:15"
}
```

| Field Name | BSON Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key (Default) | Unique internal MongoDB object identifier |
| `id` | `Integer` | Indexed Descending (`-1`) | Auto-incremented human-readable sequence number |
| `speed` | `Double / Float`| - | Delivery velocity in kilometers per hour (km/h) |
| `status` | `String` | - | Classification flag ('NORMAL', 'HIGH_SPEED', 'ALARM') |
| `timestamp` | `String` | - | Human-readable timestamp formatted as `%Y-%m-%d %H:%M:%S` |

**Index Definition**:
```python
db.runs.create_index([("id", -1)])
```

---

## 5. Typical Queries & Data Access Workflows

### 5.1 Ball-by-Ball Analysis Aggregation for Bowler Profiling
```sql
SELECT 
    bowler,
    COUNT(*) AS total_balls,
    AVG(speed_kmh) AS avg_speed,
    MAX(speed_kmh) AS peak_speed,
    AVG(turn_angle_deg) AS avg_turn,
    AVG(swing_cm) AS avg_swing,
    SUM(CASE WHEN delivery_type IN ('OFF_SPIN', 'LEG_SPIN') THEN 1 ELSE 0 END) AS spin_count,
    SUM(CASE WHEN delivery_type IN ('INSWING', 'OUTSWING') THEN 1 ELSE 0 END) AS swing_count
FROM ball_by_ball
WHERE bowler = 'Rashid Khan' AND delivery_type IS NOT NULL
GROUP BY bowler;
```

### 5.2 Pitch Map Query for Match Review
```sql
SELECT 
    id, over_no, ball_no, bowler, batsman, speed_kmh,
    delivery_type, bounce_x, bounce_y, length, line
FROM ball_by_ball
WHERE match_id = 1 AND innings_no = 1 AND bounce_x IS NOT NULL AND bounce_y IS NOT NULL
ORDER BY id ASC;
```

### 5.3 Auto-Linking Recent Delivery Analysis to Scored Ball
```sql
-- Retrieve the most recent unlinked delivery analysis recorded within the last 60 seconds
SELECT * FROM ball_by_ball 
WHERE match_id = ? AND innings_no = ? 
ORDER BY id DESC LIMIT 1;
```
