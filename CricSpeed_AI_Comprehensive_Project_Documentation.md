# CricSpeed AI — Comprehensive Project Review & System Documentation

---

## 1. Project Basic Details

* **Project Title**: **CricSpeed AI** — Smart Cricket Live Scorecard & AI Computer Vision Velocity Radar System
* **Project Objective / Abstract**: 
  **CricSpeed AI** is an intelligent Single Page Application (SPA) designed for real-time cricket match scoring, ball velocity estimation, and detailed match analytics. It merges official ICC cricket scoring logic (strike rotation, Current Run Rate, Required Run Rate, target setting, and automated winner declaration) with an AI camera velocity tracking radar powered by YOLO object detection, ByteTracker Kalman filtering, and audio sirens.
* **Problem Statement**: 
  Amateur and local cricket matches lack affordable speed tracking radar technology and automated digital scorekeeping engines. Traditional scoring applications are either purely manual or lack automated target calculation, bowler economy tracking, and real-time ball velocity measurement. CricSpeed AI solves this by integrating mobile camera computer vision with a real-time cricket engine.
* **Main Features / Modules**:
  1. **Live Scoring Console**: Touch-optimized scoring pad for normal runs, extras (Wide, No Ball, Leg Bye, Bye), and dismissals.
  2. **AI Speed Radar Tracking**: Real-time ball trajectory tracking over HTTP/HTTPS with instant velocity calculation and over-speed siren alarms.
  3. **Cricket Math Engine**: Automated Current Run Rate (CRR), Required Run Rate (RRR), Batter Strike Rate (SR), and Bowler Economy (Econ).
  4. **Target Chase & Innings Break Manager**: Auto-locks scoring when Innings 1 completes, sets target runs, and calculates live chase equations ($X$ runs needed in $Y$ balls).
  5. **Match History Archives**: Stores completed matches in SQLite and displays full scorecards with per-innings batting and bowling analytics.
* **Technologies Used**:
  - **Backend**: Python 3, Flask REST API, OpenCV, YOLO, ByteTracker, PyTorch, NumPy.
  - **Frontend**: React 18, Vite, Lucide Icons, WebAudio API, Glassmorphism CSS3.
* **Database Used**:
  - **SQLite3** (`database/scorecard.db`) with multi-threaded connection handling.

---

## 2. Users / Actors

1. **Scorer / Match Operator**:
   - Initializes new matches (team names, custom overs limit, toss choice).
   - Records ball-by-ball deliveries, extras, and dismissals.
   - Rotates strike manually or automatically.
   - Configures opening batters and bowlers for Innings 1 and Innings 2.
   - Views and clears match history archives.

2. **AI Camera Radar System (Automated Actor)**:
   - Captures live camera frames of the bowling crease.
   - Tracks tennis/cricket ball movement across frames.
   - Computes delivery speed in km/h.
   - Triggers an automated audio siren alert (`no-ball-sound-cricket.mp3`) if speed exceeds configured limit.

3. **Spectator / Team Reviewer**:
   - Views live broadcast score banner and current over delivery ticker.
   - Inspects full-screen detailed scorecards with batter strike rates and bowler peak speeds.

---

## 3. Complete Feature / Module List

### Module 1: Match Setup & Configuration
- **Create Match**: Inputs Team 1 Name, Team 2 Name, Total Overs (custom numeric field), Toss Winner, and Toss Decision (Bat/Bowl).
- **Opening Lineup**: Sets Striker, Non-Striker, and Opening Bowler.

### Module 2: Live Scoring & Delivery Controller
- **Run Buttons**: 0, 1, 2, 3, 4, 6.
- **Extra Toggles**: WIDE (+1), NO BALL (+1), LEG BYE (LB), BYE (B).
- **Wicket Dismissal Mode**: Selects dismissed batter, dismissal type (Bowled, Catch Out, LBW, Stumped, Run Out), fielder name, and new batter name. Auto-formats dismissal text (e.g., `c Carey b Starc`).
- **Strike & Bowler Rotation**: Auto-rotates strike on odd runs and over completion. Manual "Swap Strike" and "Next Bowler" selection.
- **Undo Delivery**: One-tap snapshot restoration for incorrect ball entry.

### Module 3: Innings 2 & Chase Engine
- **Innings 1 Break Banner**: Locks scoring pad when Innings 1 overs/wickets reach limit. Displays total score and target runs ($T = \text{Runs} + 1$).
- **Innings 2 Chase Banner**: Dynamically calculates and displays `${batting_team} need ${remaining_runs} runs in ${remaining_balls} balls to win` alongside RRR.
- **Auto Match Completion**: Declares winner instantly when target is passed or 2nd innings overs finish.

### Module 4: Match History & Detailed Scorecard Viewer
- **Archives List**: Displays all past matches with Team 1 vs Team 2, overs, both teams' total scores, and official winner result.
- **Full Screen Scorecard Modal**: Enlarged full-screen view containing 1st Innings and 2nd Innings tabs, Batter SR, Bowler Economy, Peak Speed, and Extras.
- **History Wipe**: Option to clear all match history.

---

## 4. Database Details

### Tables & Attributes

#### Table 1: `matches`
- `id` (INTEGER, Primary Key, Auto-increment)
- `team1` (TEXT, NOT NULL)
- `team2` (TEXT, NOT NULL)
- `total_overs` (INTEGER, NOT NULL)
- `toss_winner` (TEXT)
- `toss_decision` (TEXT)
- `current_innings` (INTEGER, Default: 1)
- `target` (INTEGER, Default: 0)
- `status` (TEXT, Default: 'LIVE')
- `winner` (TEXT, Default: '')
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

#### Table 2: `batting_scorecard`
- `id` (INTEGER, Primary Key, Auto-increment)
- `match_id` (INTEGER, Foreign Key -> `matches.id`)
- `innings_no` (INTEGER, NOT NULL)
- `player` (TEXT, NOT NULL)
- `runs` (INTEGER, Default: 0)
- `balls` (INTEGER, Default: 0)
- `fours` (INTEGER, Default: 0)
- `sixes` (INTEGER, Default: 0)
- `out_desc` (TEXT, Default: 'not out')
- `updated_at` (TIMESTAMP)
- **Constraint**: `UNIQUE(match_id, innings_no, player)`

#### Table 3: `bowling_scorecard`
- `id` (INTEGER, Primary Key, Auto-increment)
- `match_id` (INTEGER, Foreign Key -> `matches.id`)
- `innings_no` (INTEGER, NOT NULL)
- `bowler` (TEXT, NOT NULL)
- `balls` (INTEGER, Default: 0)
- `maidens` (INTEGER, Default: 0)
- `runs` (INTEGER, Default: 0)
- `wickets` (INTEGER, Default: 0)
- `max_speed` (REAL, Default: 0.0)
- `updated_at` (TIMESTAMP)
- **Constraint**: `UNIQUE(match_id, innings_no, bowler)`

#### Table 4: `ball_by_ball`
- `id` (INTEGER, Primary Key, Auto-increment)
- `match_id` (INTEGER, Foreign Key -> `matches.id`)
- `innings_no` (INTEGER, NOT NULL)
- `over_no` (INTEGER, NOT NULL)
- `ball_no` (INTEGER, NOT NULL)
- `batsman` (TEXT, NOT NULL)
- `bowler` (TEXT, NOT NULL)
- `runs` (INTEGER, Default: 0)
- `extra_type` (TEXT)
- `wicket` (TEXT)
- `speed_kmh` (REAL, Default: 0.0)
- `created_at` (TIMESTAMP)

---

## 5. Key Source Code Snippets

### Core Scoring & Physics Calculation (`ai/scorecard_engine.py`)
```python
def get_state(self, over_completed=False):
    overs_formatted = f"{self.balls // 6}.{self.balls % 6}"
    crr = round((self.runs / (self.balls / 6.0)), 2) if self.balls > 0 else 0.0
    
    remaining_balls = (self.total_overs * 6) - self.balls
    remaining_runs = self.target - self.runs if self.target > 0 else 0
    rrr = round((remaining_runs / (remaining_balls / 6.0)), 2) if (remaining_balls > 0 and self.current_innings == 2 and remaining_runs > 0) else 0.0

    return {
        "match_id": self.match_id,
        "team1": self.team1,
        "team2": self.team2,
        "current_innings": self.current_innings,
        "runs": self.runs,
        "wickets": self.wickets,
        "overs": overs_formatted,
        "crr": crr,
        "rrr": rrr,
        "target": self.target,
        "status": self.status,
        "winner": self.winner
    }
```

---

## 6. Major Workflows

### Workflow 1: Match Setup
`Scorer` → Opens "New Match" modal → Enters Team 1, Team 2, Overs, Toss Winner/Choice, Opening Batters, Opening Bowler → `Flask API (/api/match/create)` saves to SQLite → `MatchEngine` initializes state → UI loads Scorecard Console.

### Workflow 2: Ball Delivery & Velocity Logging
`Scorer` taps Run Button (e.g. `4`) → `Flask API (/api/match/ball)` fetches live velocity from AI Speed Estimator → `MatchEngine` updates Striker runs (+4), Bowler runs (+4), increments balls, calculates CRR → `SQLite` updates `batting_scorecard` & `bowling_scorecard` → UI updates score banner & over delivery ticker.

### Workflow 3: Innings 1 Break & 2nd Innings Chase
Innings 1 overs reach limit → `MatchEngine` sets status to `INNINGS_BREAK` and calculates `target = runs + 1` → Scoring console locks → `Scorer` taps "Setup 2nd Innings" → Enters chasing batters & opening bowler → Status becomes `LIVE` → UI displays live chase equation (`Need X runs in Y balls`).

### Workflow 4: Match Completion & Archiving
Target is reached OR 2nd innings overs complete → `MatchEngine` calculates margin of victory → Sets status to `COMPLETED` → Saves match summary to `matches` table → Scorecard locked with Winner Banner → Match appears in **History Archives** tab.
