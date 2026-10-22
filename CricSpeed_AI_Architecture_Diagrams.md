# CricSpeed AI — Project Architecture & UML Diagrams

This document contains complete UML design diagrams for the **CricSpeed AI** Cricket Live Scorecard & Computer Vision Velocity Radar System. 

You can use the provided **Mermaid code blocks** directly in your project report, slides, or render them using [Mermaid Live Editor](https://mermaid.live) or Draw.io.

---

## 1. Use Case Diagram

The Use Case Diagram illustrates the functional interactions between the **Scorer / User**, **Camera Tracker System**, and the **CricSpeed AI Core Engine**.

```mermaid
graph TD
    User(("👤 Scorer / User"))
    CamTracker(("📹 AI Camera Tracker"))

    subgraph CricSpeed_AI_System ["⚡ CricSpeed AI Core System"]
        UC1["Create & Configure New Match"]
        UC2["Record Ball-by-Ball Score"]
        UC3["Auto Calculate CRR, RRR & Strike Rates"]
        UC4["Detect Ball Speed & No-Ball Siren"]
        UC5["Handle Dismissal & Wicket Mode"]
        UC6["Innings 1 Break & Target Setting"]
        UC7["Setup 2nd Innings Target Chase"]
        UC8["Declare Winner & Match Completion"]
        UC9["View Match History Archives"]
        UC10["View Full Screen Detailed Scorecard"]
        UC11["Clear Match Archives"]
    end

    User --> UC1
    User --> UC2
    User --> UC5
    User --> UC7
    User --> UC9
    User --> UC10
    User --> UC11

    CamTracker --> UC4
    UC4 --> UC2

    UC2 --> UC3
    UC2 --> UC6
    UC6 --> UC7
    UC7 --> UC8
```

---

## 2. Class Diagram

The Class Diagram highlights the Object-Oriented Software Architecture of CricSpeed AI, connecting the **Flask REST API**, **MatchEngine**, **Database Helper**, and **AI Computer Vision** modules.

```mermaid
classDiagram
    class MatchEngine {
        +int match_id
        +string team1
        +string team2
        +int total_overs
        +int current_innings
        +int target
        +int runs
        +int wickets
        +int balls
        +string striker
        +string non_striker
        +string bowler
        +dict batting
        +dict bowling
        +string status
        +string winner
        +start_new_match(team1, team2, total_overs, toss_winner, toss_decision)
        +setup_innings(striker, non_striker, bowler, target, current_innings)
        +record_delivery(mode, runs, wicket_desc, new_batsman, who_out, speed_kmh)
        +undo()
        +swap_batsmen()
        +get_state()
    }

    class ScorecardDB {
        +string DB_PATH
        +init_scorecard_db()
        +create_match(team1, team2, total_overs, toss_winner, toss_decision)
        +save_batting_stat(match_id, innings_no, player, runs, balls, fours, sixes, out_desc)
        +save_bowling_stat(match_id, innings_no, bowler, balls, maidens, runs, wickets, max_speed)
        +log_ball(match_id, innings_no, over_no, ball_no, batsman, bowler, runs, extra_type, wicket, speed_kmh)
        +get_scorecard_details(match_id)
        +get_all_matches()
        +clear_all_matches()
    }

    class Camera {
        +bool is_running
        +start()
        +stop()
        +get_frame()
    }

    class VideoProcessor {
        +YOLO model
        +ndarray H
        +process(input_video, output_video, max_speed)
    }

    class ByteTracker {
        +float dt
        +float high_threshold
        +update(detections, scores)
    }

    class SpeedEstimator {
        +float fps
        +float max_speed_limit
        +calculate_speed(p1, p2, H)
        +validate_and_smooth(instant_speed, pixel_dist, prev_speed)
    }

    class AlarmSystem {
        +float speed_limit
        +check(speed)
    }

    MatchEngine --> ScorecardDB : Persists Stats & Balls
    VideoProcessor --> ByteTracker : Uses Kalman Tracking
    VideoProcessor --> SpeedEstimator : Computes Velocity
    VideoProcessor --> AlarmSystem : Triggers Over-speed Alarm
    Camera --> VideoProcessor : Supplies Live Video Frames
```

---

## 3. Sequence Diagram

This diagram shows the exact chronological execution flow when a Scorer inputs a delivery (or AI camera detects speed), updates match state, recalculates CRR/RRR, logs to SQLite, and updates the UI.

```mermaid
sequenceDiagram
    autonumber
    actor Scorer as 👤 Scorer (Frontend UI)
    participant API as 🌐 Flask REST API (/api/match/ball)
    participant Engine as ⚙️ MatchEngine
    participant AI as 📹 SpeedEstimator / Radar
    participant DB as 💾 Scorecard Database (SQLite)

    Scorer->>API: POST /api/match/ball { mode: "NORMAL", runs: 4, speed_kmh: 124.5 }
    API->>AI: Fetch Peak Speed if active
    AI-->>API: Return 124.5 km/h
    API->>Engine: record_delivery(mode="NORMAL", runs=4, speed_kmh=124.5)
    
    Engine->>Engine: Update Striker runs & balls (+4 runs, +1 ball, +1 four)
    Engine->>Engine: Update Bowler stats (+4 runs, +1 ball, max_speed=124.5)
    Engine->>Engine: Calculate CRR = (runs / (balls / 6.0))
    
    alt Innings 2 Chasing Active
        Engine->>Engine: Calculate RRR = (remaining_runs / (remaining_balls / 6.0))
    end

    Engine->>DB: log_ball(match_id, innings_no, over_no, ball_no, ...)
    Engine->>DB: save_batting_stat(...)
    Engine->>DB: save_bowling_stat(...)

    Engine->>Engine: Check Innings / Match Completion
    Engine-->>API: Return updated match state JSON
    API-->>Scorer: HTTP 200 OK (Render Broadcast Score Banner & Ticker)
```

---

## 4. Activity Diagram

The Activity Diagram captures the complete operational workflow of a Cricket Match in CricSpeed AI—from setup through Innings 1, Innings Break, Innings 2 Target Chase, and Winner Declaration.

```mermaid
stateDiagram-v2
    [*] --> MatchInitialization : Scorer launches New Match

    state MatchInitialization {
        [*] --> InputTeamsAndOvers
        InputTeamsAndOvers --> SelectTossWinner
        SelectTossWinner --> InputOpeningPlayers
    }

    MatchInitialization --> Innings1Scoring : Innings 1 Started

    state Innings1Scoring {
        [*] --> AwaitDeliveryInput
        AwaitDeliveryInput --> ProcessBall : Normal / Extra / Wicket Input
        ProcessBall --> LogBallAndStats
        LogBallAndStats --> CheckInnings1Over : Overs >= Total Overs OR Wickets >= 10?
        CheckInnings1Over --> AwaitDeliveryInput : No
    }

    Innings1Scoring --> InningsBreak : Innings 1 Overs/Wickets Complete

    state InningsBreak {
        [*] --> SetTargetRuns : Target = (Innings 1 Runs) + 1
        SetTargetRuns --> ShowInnings1Summary
        ShowInnings1Summary --> Await2ndInningsSetup
    }

    InningsBreak --> Innings2Scoring : Scorer configures 2nd Innings

    state Innings2Scoring {
        [*] --> ChasingTarget
        ChasingTarget --> RecordInnings2Delivery
        RecordInnings2Delivery --> CheckTargetReached : Runs >= Target?
        CheckTargetReached --> TargetAchieved : Yes (Batting Team Wins)
        CheckTargetReached --> CheckOversFinished : No -> Overs >= Total Overs OR Wickets >= 10?
        CheckOversFinished --> BowlingTeamWins : Yes
        CheckOversFinished --> ChasingTarget : No
    }

    TargetAchieved --> MatchCompleted
    BowlingTeamWins --> MatchCompleted

    state MatchCompleted {
        [*] --> DeclareWinner
        DeclareWinner --> ArchiveToDatabase
        ArchiveToDatabase --> ViewHistoryAndScorecard
    }

    MatchCompleted --> [*]
```
