# CricSpeed AI: System Architecture & Design Diagrams

This document presents the complete architectural and behavioral modeling of the CricSpeed AI system using standard Mermaid diagrams accompanied by exhaustive technical explanations.

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (React 19 + Vite SPA)"]
        UI_Live["Live AI Radar Screen (LiveCameraRadar.jsx)"]
        UI_Upload["Video Analyzer (VideoUpload.jsx)"]
        UI_Score["Live Scorecard (LiveScorecard.jsx)"]
        UI_Analytics["Analytics Dashboard (AnalyticsDashboard.jsx)"]
        UI_Pitch["Interactive Pitch Map (PitchMap.jsx)"]
        UI_Card["Delivery Analysis Card (DeliveryAnalysisCard.jsx)"]
    end

    subgraph APILayer ["Application & API Layer (Flask 3.1.3 WSGI)"]
        API_Stream["/video_feed (MJPEG Stream)"]
        API_Frame["/process_frame (Live Frame Inference)"]
        API_Upload["/upload & /api/upload/status (Video Polling)"]
        API_Score["/api/match/* (Scorecard Engine Endpoints)"]
        API_Bowler["/api/bowler/analysis (Analytics Aggregator)"]
    end

    subgraph CVLayer ["Computer Vision & AI Inference Engine"]
        YOLO["YOLOv8 Ball Detector (tennis_ball_detector.pt)"]
        Tracker["ByteTracker Multi-Object Kalman Filter"]
        Cleaner["Track Cleaner (MAD Outlier & Gap Interpolator)"]
        SpeedEng["Speed Estimator (EMA Smoothing & Homography)"]
        AnalysisEng["Delivery Movement Analyzer (Bounce & Regression)"]
        HUD["Overlay HUD Renderer (OpenCV Drawing)"]
        VideoProc["Multi-Delivery Video Processor (FFmpeg H.264)"]
    end

    subgraph DataLayer ["Persistence & Storage Layer"]
        SQLite[("SQLite 3 Database (scorecard.db)")]
        MongoDB[("MongoDB Document Store (cricspeed.runs)")]
        Weights[("Model Weights & Config (weights/ & config.py)")]
    end

    UI_Live -->|HTTP POST Base64 Frames| API_Frame
    UI_Live -->|HTTP GET Stream| API_Stream
    UI_Upload -->|Multipart Video Upload| API_Upload
    UI_Score -->|Match & Ball REST Calls| API_Score
    UI_Analytics -->|Bowler Query| API_Bowler

    API_Frame --> YOLO
    API_Upload --> VideoProc
    VideoProc --> YOLO

    YOLO --> Tracker
    Tracker --> Cleaner
    Cleaner --> SpeedEng
    Cleaner --> AnalysisEng
    SpeedEng --> HUD
    AnalysisEng --> HUD

    API_Score --> SQLite
    API_Bowler --> SQLite
    SpeedEng -->|Log Speed Run| MongoDB
    API_Score -.->|Auto-link Delivery| AnalysisEng
```

### Architectural Explanation
The architecture follows a decoupled, three-tier model:
- **Presentation Layer**: Built with React 19 and Vite, rendering dynamic dark glassmorphic dashboards. Client-side state manages active video streams, interactive pitch maps, batsman handedness toggle, and ball-by-ball scorecards.
- **Application & API Layer**: Flask serves as the central API gateway and WSGI streaming server. It exposes 26 RESTful routes and streaming endpoints handling live frame processing, multipart video uploads with asynchronous progress polling, and match engine state transitions.
- **AI & Computer Vision Engine**: Operates as a sequential pipeline: raw frames pass through YOLOv8 for tennis ball detection, ByteTracker associates ball detections across frames, `track_cleaning.py` removes spurious velocity spikes, and `delivery_analysis.py` computes turn, swing, bounce coordinates, and trajectory metrics.
- **Persistence Layer**: Employs a dual-database approach. SQLite provides ACID transactional guarantees for cricket scorecards and historical delivery analyses, while MongoDB logs high-frequency speed radar entries.

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Bowler["Cricket Bowler"]
    Scorer["Match Scorer / Coach"]
    Analyst["Team Analyst / Viewer"]

    subgraph UseCases ["CricSpeed AI System Use Cases"]
        UC1(["UC-01: Calibrate Pitch Perspectives"])
        UC2(["UC-02: Stream Live Bowling Radar"])
        UC3(["UC-03: Toggle Batter Handedness (RHB/LHB)"])
        UC4(["UC-04: View Real-Time Speed & Ball Movement"])
        UC5(["UC-05: Upload & Analyze Recorded Match Videos"])
        UC6(["UC-06: Inspect Interactive 22-Yard Pitch Map"])
        UC7(["UC-07: Score Match Ball-by-Ball with Auto-Linked CV"])
        UC8(["UC-08: Execute Single-Click Undo on Misrecorded Balls"])
        UC9(["UC-09: Generate Bowler Profiling & Aggregated Stats"])
        UC10(["UC-10: Export Annotated Video with HUD Graphics"])
    end

    Bowler --> UC2
    Bowler --> UC4

    Scorer --> UC1
    Scorer --> UC2
    Scorer --> UC3
    Scorer --> UC7
    Scorer --> UC8

    Analyst --> UC3
    Analyst --> UC5
    Analyst --> UC6
    Analyst --> UC9
    Analyst --> UC10
```

### Explanation of Use Cases
- **Bowler**: Interacts primarily with the real-time speed radar to receive instant velocity feedback (km/h) and delivery classifications during practice net sessions.
- **Match Scorer / Coach**: Sets up match fixtures, selects toss decisions, toggles batsman handedness, records runs/extras/wickets, and relies on automated delivery linkage to attach AI telemetry to each legal ball. In case of user error, the single-click undo reverts match state cleanly.
- **Team Analyst / Viewer**: Uploads multi-delivery match footage, navigates deliveries via the interactive SVG pitch map, evaluates bowler consistency across pitch zones, and exports annotated MP4 videos with broadcast HUD telemetry.

---

## 3. Detailed Class Diagram

```mermaid
classDiagram
    class Config {
        +String BASE_DIR
        +String MODEL_PATH
        +String MONGO_URI
        +Float TURN_MIN_DEG
        +Float SWING_MIN_M
        +Float SPIN_SPEED_MAX
        +Float FALLBACK_PIXEL_TO_METER
    }

    class SpeedEstimator {
        -Float px_to_m
        -Float ema_alpha
        -Float prev_speed
        -List~Tuple~ history
        +calculate_speed(p1, p2, dt) Float
        +pixel_to_ground(px, py) Tuple~Float, Float~
        +reset() Void
    }

    class ByteTracker {
        -List~STrack~ tracked_stracks
        -List~STrack~ lost_stracks
        -KalmanFilter kalman_filter
        +update(output_results, img_info, img_size) List~STrack~
    }

    class TrackCleaner {
        +clean_track(track_points) List~Dict~
        -_mad_filter(velocities) List~Boolean~
        -_interpolate_gaps(points) List~Dict~
        -_reject_reverse_throws(points) List~Dict~
    }

    class DeliveryAnalyzer {
        +analyze_delivery(track_points, fps, batsman_hand) Dict
        -_detect_bounce_index(points, fps) Integer
        -_fit_trajectory_angle(points) Float
        -_calculate_swing(pre_points) Float
        -_classify_delivery(turn, swing, speed, hand) Tuple
    }

    class OverlayHUDRenderer {
        +draw_live_overlay(frame, history_points) ndarray
        +draw_post_delivery_overlay(frame, analysis, speed) ndarray
        -_draw_pitch_zones(frame) Void
        -_draw_telemetry_banner(frame, metrics) Void
    }

    class MatchEngine {
        -Connection db_conn
        +create_match(team1, team2, overs, toss_w, toss_d) Integer
        +score_ball(match_id, batsman, bowler, runs, extra, wicket, speed, analysis) Dict
        +undo_last_ball(match_id) Dict
        +get_match_summary(match_id) Dict
        +get_bowler_analysis(bowler_name) Dict
    }

    class DatabaseHelper {
        -MongoClient client
        -Database db
        +init_db() Void
        +add_run(speed, status) Void
        +get_runs(limit) List~Dict~
    }

    ByteTracker ..> TrackCleaner : Feeds raw track
    TrackCleaner ..> SpeedEstimator : Feeds filtered coords
    TrackCleaner ..> DeliveryAnalyzer : Feeds cleaned trajectory
    DeliveryAnalyzer ..> OverlayHUDRenderer : Supplies telemetry
    SpeedEstimator ..> DatabaseHelper : Logs speed run
    DeliveryAnalyzer ..> MatchEngine : Links delivery to ball
    Config <.. SpeedEstimator : Injects parameters
    Config <.. DeliveryAnalyzer : Injects thresholds
```

---

## 4. Sequence Diagram 1: Real-Time Live AI Radar & Delivery Analysis

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Scorer
    participant UI as React UI (LiveCameraRadar)
    participant Flask as Flask Server (app.py)
    participant YOLO as YOLOv8 Detector
    participant Tracker as ByteTracker & Cleaner
    participant Analyzer as DeliveryAnalyzer
    participant SQLite as SQLite (scorecard.db)
    participant Mongo as MongoDB (cricspeed)

    User->>UI: Selects Batter Stance (e.g. 'RIGHT')
    loop Every Video Frame (~30-60 FPS)
        UI->>Flask: POST /process_frame (Base64 JPEG, batsman_hand='RIGHT')
        Flask->>YOLO: Detect Ball Bounding Box (conf=0.15)
        YOLO-->>Flask: Bounding Box Coordinates (x, y, w, h)
        Flask->>Tracker: Update Track History & Kalman Filter
        Tracker-->>Flask: Active Ball Trajectory Coordinates
        Flask->>Flask: SpeedEstimator.calculate_speed()
        alt Ball Delivery Completed (Lost for 8 frames)
            Flask->>Tracker: TrackCleaner.clean_track()
            Tracker-->>Flask: Filtered Smooth Trajectory
            Flask->>Analyzer: analyze_delivery(clean_track, fps, 'RIGHT')
            Analyzer->>Analyzer: Detect Bounce Inflection (dy > 0 -> dy <= 0)
            Analyzer->>Analyzer: Fit Pre & Post Bounce Linear Regression
            Analyzer->>Analyzer: Compute Turn (Δθ), Swing (cm), Length & Line
            Analyzer-->>Flask: Analysis Payload (OFF_SPIN, 3.8°, 85 km/h)
            Flask->>Mongo: add_run(85.0, 'NORMAL')
            Flask->>Flask: Cache delivery in memory (TTL = 60s)
        end
        Flask-->>UI: JSON { speed: 85.0, delivery_analysis: {...}, frame: "data:image/jpeg;..." }
        UI->>UI: Update Speed Dial, DeliveryAnalysisCard & Last 6 Strip
    end
    User->>UI: Clicks "Score 4 Runs"
    UI->>Flask: POST /api/match/ball { match_id: 1, runs: 4, batsman: "Player A", bowler: "Player B" }
    Flask->>SQLite: Save Ball Record & Auto-Link Cached Delivery Analysis
    SQLite-->>Flask: Ball Saved (ID: 12, Analysis Attached)
    Flask-->>UI: Updated Match State (Score, Overs, Bowler Figures)
```

---

## 5. Sequence Diagram 2: Video Upload, Polling & Multi-Delivery Extraction

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Analyst / Coach
    participant UI as React UI (VideoUpload)
    participant Flask as Flask Server (app.py)
    participant Processor as VideoProcessor
    participant YOLO as YOLOv8 Detector
    participant Analyzer as DeliveryAnalyzer
    participant FFmpeg as FFmpeg Hardware Transcoder

    Analyst->>UI: Selects Video File (match_clip.mp4) & Clicks "Analyse"
    UI->>Flask: POST /upload (Multipart Video File, batsman_hand='RIGHT')
    Flask->>Flask: Generate Unique task_id & Save File to uploads/
    Flask-->>UI: HTTP 202 Accepted { task_id: "uuid-123", status: "processing" }
    Flask->>Processor: Start Background Thread process_uploaded_video()
    
    loop Every 500ms Polling
        UI->>Flask: GET /api/upload/status?task_id=uuid-123
        Flask-->>UI: HTTP 200 { progress: 45, status: "processing" }
        UI->>UI: Render Animated Progress Bar (45%)
    end

    Processor->>Processor: Iterate Frames & Extract Ball Trajectories
    Processor->>YOLO: Infer Frame Detections
    Processor->>Processor: Segment Continuous Deliveries
    loop For Each Detected Delivery
        Processor->>Analyzer: analyze_delivery(delivery_track)
        Analyzer-->>Processor: Delivery Metrics (Type, Speed, Bounce Point)
        Processor->>Processor: Draw Overlay HUD for OVERLAY_HOLD_SECONDS
    end
    Processor->>FFmpeg: Transcode Annotated Frames to H.264 MP4
    FFmpeg-->>Processor: processed_video.mp4 Ready
    Processor->>Flask: Update Task Status { progress: 100, deliveries: [...], summary: {...} }

    UI->>Flask: GET /api/upload/status?task_id=uuid-123
    Flask-->>UI: HTTP 200 { progress: 100, status: "complete", deliveries: [...], summary: {...} }
    UI->>UI: Display HTML5 Player, PitchMap Bounce Dots & Delivery List Table
```

---

## 6. Activity Diagram: Delivery Analytics & Movement Classification

```mermaid
stateDiagram-v2
    [*] --> InitializeCamera : Video Feed Opened
    InitializeCamera --> DetectBall : YOLOv8 Inference
    DetectBall --> TrackBall : ByteTracker Active
    TrackBall --> CheckLost : Ball Lost Frames >= 8?
    CheckLost --> DetectBall : No, Continue Tracking
    
    CheckLost --> CleanTrajectory : Yes, Delivery Ended
    state CleanTrajectory {
        [*] --> FilterSpikes : Median Absolute Deviation
        FilterSpikes --> InterpolateGaps : Linear Gap Fill (<= 2 frames)
        InterpolateGaps --> TruncateRebound : Check Batsman Contact / Peak Y
        TruncateRebound --> RejectReturnThrow : Forward Motion Validation
        RejectReturnThrow --> [*]
    }

    CleanTrajectory --> ValidatePoints : Points >= 6 & Span >= 3m?
    ValidatePoints --> InsufficientData : No
    InsufficientData --> [*] : Return Status "insufficient_data"

    ValidatePoints --> LocateBounce : Yes, Find Vertical Velocity Inflection
    state LocateBounce {
        [*] --> CalculateDiff : dy = y[i+1] - y[i]
        CalculateDiff --> ScanInflection : Scan dy > 0 to dy <= 0
        ScanInflection --> CheckPitchLimits : 4.0m <= y_bounce <= 18.0m
        CheckPitchLimits --> [*]
    }

    LocateBounce --> ComputeAngles : Bounce Found
    state ComputeAngles {
        [*] --> FitPreBounce : Linear Regression (Release -> Bounce)
        FitPreBounce --> FitPostBounce : Linear Regression (Bounce -> Stumps)
        FitPostBounce --> CalculateTurn : Turn = |θ_post - θ_pre|
        CalculateTurn --> CalculateSwing : Max Lateral Deviation from Straight Line
        CalculateSwing --> [*]
    }

    ComputeAngles --> ClassifyMovement : Evaluate Thresholds
    state ClassifyMovement {
        [*] --> CheckSpeed : Speed <= 110 km/h?
        CheckSpeed --> CheckTurn : Yes (Spin Domain)
        CheckTurn --> OffSpin : Turn >= 1.5° (Inward to RHB)
        CheckTurn --> LegSpin : Turn >= 1.5° (Away from RHB)
        CheckTurn --> StraightDelivery : Turn < 1.5°

        CheckSpeed --> CheckSwing : No (Pace Domain)
        CheckSwing --> Inswing : Swing >= 5cm (Inward to RHB)
        CheckSwing --> Outswing : Swing >= 5cm (Away from RHB)
        CheckSwing --> StraightDelivery : Swing < 5cm
    }

    ClassifyMovement --> AdjustHandedness : Batsman Hand == LEFT?
    AdjustHandedness --> InvertClassification : Yes, Invert Stance Labels
    AdjustHandedness --> GenerateExplanation : No, Stance is Standard RHB
    InvertClassification --> GenerateExplanation
    GenerateExplanation --> RenderHUD : Output Structured JSON & Draw Overlays
    RenderHUD --> [*]
```

---

## 7. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    MATCHES ||--o{ BATTING_SCORECARD : "has many batting records"
    MATCHES ||--o{ BOWLING_SCORECARD : "has many bowling records"
    MATCHES ||--o{ BALL_BY_BALL : "logs every delivery"

    MATCHES {
        int id PK "Auto Increment"
        string team1 "Team 1 Name"
        string team2 "Team 2 Name"
        int total_overs "Overs per Innings"
        string toss_winner "Toss Winner"
        string toss_decision "BAT or BOWL"
        int current_innings "1 or 2"
        int target "Target Score"
        string status "LIVE or COMPLETED"
        string winner "Match Result"
        timestamp created_at "Created Time"
    }

    BATTING_SCORECARD {
        int id PK "Auto Increment"
        int match_id FK "References MATCHES(id)"
        int innings_no "Innings (1 or 2)"
        string player "Batter Name"
        int runs "Runs Scored"
        int balls "Balls Faced"
        int fours "Fours Hit"
        int sixes "Sixes Hit"
        string out_desc "Dismissal String"
        timestamp updated_at "Last Updated"
    }

    BOWLING_SCORECARD {
        int id PK "Auto Increment"
        int match_id FK "References MATCHES(id)"
        int innings_no "Innings (1 or 2)"
        string bowler "Bowler Name"
        int balls "Balls Bowled"
        int maidens "Maiden Overs"
        int runs "Runs Conceded"
        int wickets "Wickets Taken"
        float max_speed "Peak Speed (km/h)"
        timestamp updated_at "Last Updated"
    }

    BALL_BY_BALL {
        int id PK "Auto Increment"
        int match_id FK "References MATCHES(id)"
        int innings_no "Innings (1 or 2)"
        int over_no "Over Number"
        int ball_no "Ball Number"
        string batsman "Striker Name"
        string bowler "Bowler Name"
        int runs "Runs Scored"
        string extra_type "wide, no_ball, bye, leg_bye"
        string wicket "Dismissal Type"
        float speed_kmh "Measured Speed"
        string delivery_type "OFF_SPIN, LEG_SPIN, INSWING, OUTSWING, STRAIGHT"
        string spin_type "OFF_BREAK, LEG_BREAK, NONE"
        string swing_type "INSWING, OUTSWING, NONE"
        float turn_angle_deg "Bounce Turn Angle"
        float swing_cm "Flight Swing Deviation"
        float bounce_x "Pitch X Position"
        float bounce_y "Pitch Y Position"
        string length "YORKER, FULL, GOOD_LENGTH, SHORT"
        string line "OUTSIDE_OFF, OFF_STUMP, MIDDLE, LEG_STUMP, OUTSIDE_LEG"
        float analysis_confidence "Confidence (0-1)"
        string analysis_json "Serialized Full Telemetry"
        timestamp created_at "Ball Timestamp"
    }

    MONGODB_RUNS {
        ObjectId _id PK "Mongo Internal ID"
        int id "Sequence Number"
        float speed "Delivery Velocity (km/h)"
        string status "NORMAL or ALARM"
        string timestamp "Recorded Time"
    }
```

### Explanation of Relational Modeling
- **Foreign Key Integrity**: Each match row in `matches` owns multiple batting records, bowling records, and individual ball-by-ball rows through foreign key references (`match_id` referencing `matches.id`).
- **Composite Unique Keys**: `UNIQUE(match_id, innings_no, player)` in `batting_scorecard` and `UNIQUE(match_id, innings_no, bowler)` in `bowling_scorecard` guarantee zero accidental duplicate rows per player per innings.
- **Delivery Analytics Integration**: The `ball_by_ball` table encapsulates both core cricket scoring metrics and deep computer vision telemetry, enabling direct correlation between bowling movement (turn angle, swing deviation, pitch length/line) and match outcomes (dot balls, boundaries, dismissals).
