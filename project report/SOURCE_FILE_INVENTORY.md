# CricSpeed AI: Source Code & File Inventory

This inventory provides a comprehensive breakdown of all source files, modules, components, and scripts comprising the CricSpeed AI platform.

---

## 1. Backend Application Modules (`/` and `ai/`, `database/`)

| File Path | Lines | Primary Responsibility | Key Classes / Functions | Primary Dependencies |
| :--- | :---: | :--- | :--- | :--- |
| `app.py` | 892 | Central Flask REST & streaming server; manages 26 endpoints, camera feeds, scorecard APIs, and video processing. | `video_feed()`, `process_frame()`, `upload_video()`, `get_upload_status()`, `score_ball()`, `undo_last_ball()`, `bowler_analysis()` | Flask, OpenCV, YOLO, ByteTracker, SQLite, PyMongo |
| `config.py` | 60 | Global application configuration, paths, model thresholds, calibration constants, and analysis parameters. | `Config` class | os, json |
| `ai/camera.py` | 29 | Video capture abstraction supporting local webcams, video files, and RTSP network streams with frame generators. | `Camera` class, `get_frame()` | cv2 |
| `ai/alarm.py` | 43 | Threshold-based speed alarm monitor logging excessive speeds to file and system logs. | `check_speed()`, `log_alarm()` | logging, datetime |
| `ai/tracker.py` | 230 | Multi-object tracking engine implementing ByteTrack with Kalman filtering for robust sports ball association. | `ByteTracker`, `STrack`, `KalmanFilter` | numpy, scipy |
| `ai/speed.py` | 137 | Ball velocity estimator computing inter-frame pixel displacement, fallback scaling ($0.025\text{ m/px}$), and EMA smoothing. | `SpeedEstimator`, `pixel_to_ground()` | numpy, config |
| `ai/delivery_analysis.py` | 329 | Core movement analytics: inflection bounce detection, trajectory linear regression, turn angle, swing, length, line, handedness inversion. | `analyze_delivery()`, `_detect_bounce_index()`, `_fit_trajectory_angle()`, `_classify_delivery()` | numpy, scipy |
| `ai/track_cleaning.py` | 168 | Outlier trajectory cleaner: MAD velocity filtering, $\le 2$ frame linear gap interpolation, reverse throw rejection, rebound truncation. | `clean_track()`, `_mad_filter()`, `_interpolate_gaps()`, `_reject_reverse_throws()` | numpy |
| `ai/overlay_hud.py` | 210 | OpenCV visual rendering engine: live fading cyan trail, amber bounce impact ring, emerald/crimson trajectory lines, HUD banner. | `draw_live_overlay()`, `draw_post_delivery_overlay()` | cv2, numpy |
| `ai/video_processor.py` | 499 | Offline multi-delivery video segmenter, frame processor, overlay renderer, and H.264 MP4 export using FFmpeg. | `process_uploaded_video()`, `_segment_deliveries()`, `_export_mp4()` | cv2, subprocess, config |
| `ai/scorecard_engine.py` | 438 | Pure cricket match business logic: overs, extras (wides/no-balls/byes/leg-byes), maidens, wickets, strike rotation, undo. | `MatchEngine` class | sqlite3, datetime |
| `ai/utils.py` | 108 | 4-point planar homography pitch calibration manager supporting multiple perspective profiles (`default`, `behind_bowler`). | `PitchHomography`, `load_calibration()`, `save_calibration()` | cv2, numpy, json |
| `database/db_helper.py` | 64 | MongoDB client wrapper for the `cricspeed.runs` collection, sequence numbering, and health check ping. | `init_db()`, `add_run()`, `get_runs()`, `get_db()` | pymongo, config |
| `database/scorecard_db.py` | 472 | SQLite relational interface: connection management (`timeout=20.0`), idempotent schema migrations, CRUD for scorecards. | `get_connection()`, `init_scorecard_db()`, `create_match()`, `get_match_summary()`, `save_ball()` | sqlite3, os |

---

## 2. Frontend React Client Modules (`frontend/src/`)

| File Path | Lines | Component / Module Role | Key Features & Responsibilities | Key Dependencies |
| :--- | :---: | :--- | :--- | :--- |
| `src/main.jsx` | 10 | Application entry point mounting React root into DOM. | StrictMode root render | React 19, ReactDOM |
| `src/App.jsx` | 83 | Main layout container, top navigation bar routing, tab state management (`Live`, `Upload`, `Scorecard`, `Analytics`, `History`). | Active tab state, dark theme container | Lucide React |
| `src/App.css` | 184 | Glassmorphic design tokens, animations, layout utilities, scrollbar styling. | Global UI theme variables | CSS3 |
| `src/index.css` | 289 | Reset styles, typography, responsive flex/grid layouts, mobile breakpoints (360px). | Mobile responsiveness | CSS3 |
| `src/components/Navbar.jsx` | 133 | Responsive top navigation bar with tab switching, connection status badge, and branding. | Navigation, mobile hamburger/tab icons | Lucide React |
| `src/components/LiveCameraRadar.jsx` | 675 | Real-time live camera radar view: live streaming feed, speed dial, last 6 balls strip, DeliveryAnalysisCard, hand toggle. | Live stream canvas, speed readout, delivery card | Lucide React |
| `src/components/VideoUpload.jsx` | 654 | Offline video analyzer: drag-and-drop file upload, progress polling (`/api/upload/status`), video player, PitchMap, delivery list. | Progress bar, video player, delivery row selection | Lucide React |
| `src/components/PitchMap.jsx` | 383 | Top-down responsive SVG cricket pitch (22 yards) rendering color-coded bounce points with hover inspection and click selection. | Responsive SVG pitch, creases, stumps, legend | SVG, React |
| `src/components/DeliveryAnalysisCard.jsx` | 364 | Detailed delivery breakdown card: type badge, speed, turn arrow, swing, length, line, confidence, expandable XAI explanation. | Expandable "Why?" reasoning, turn vector | Lucide React |
| `src/components/DeliveryTypeBadge.jsx` | 113 | Standardized color-coded badge component for `OFF_SPIN`, `LEG_SPIN`, `INSWING`, `OUTSWING`, `STRAIGHT`. | Uniform color mappings, tooltips | Lucide React |
| `src/components/BatsmanHandToggle.jsx` | 122 | Interactive stance switch (Right-Hand / Left-Hand Batsman) persisted in browser `localStorage`. | Stance toggle, persistence | Lucide React |
| `src/components/LiveScorecard.jsx` | 1152 | Full interactive cricket scorecard: ball scoring buttons (0-6, W, Wd, Nb, B, Lb), strike rotation, undo, linked delivery chip. | Score scoring pad, strike rotation, delivery modal | Lucide React |
| `src/components/MatchSetupModal.jsx` | 217 | Modal dialogue for configuring new cricket matches (team names, overs, toss winner, toss decision). | Form validation, match initialization | Lucide React |
| `src/components/MatchSummaryView.jsx` | 559 | Match results and statistics modal: detailed batting scorecard, bowling analysis, ball-by-ball log, match pitch map. | Tabbed match statistics, print/export | Lucide React |
| `src/components/AnalyticsDashboard.jsx` | 246 | Bowler performance analytics: bowler dropdown selector, speed averages, spin/swing ratio bar charts, bowler pitch map. | Pitch map aggregation, metric cards | Lucide React |

---

## 3. Test Suites & Benchmarking Utilities (`tests/` and `tools/`)

| File Path | Lines | Script Role | Description & Test Coverage |
| :--- | :---: | :--- | :--- |
| `tests/test_delivery_analysis.py` | 465 | Automated Pytest Unit Test Suite | 15 comprehensive unit tests covering spin turn classification, swing deviation, handedness flip, track cleaning, gap interpolation, idempotent migrations, scorecard flow, API auto-linking, and overlay rendering. |
| `tools/evaluate_analysis.py` | 512 | Synthetic Benchmark Evaluator | Evaluates classification precision, recall, confusion matrix, MAE, and RMSE across 13 diverse trajectory profiles. |
| `tools/calibrate_pitch.py` | 148 | Interactive Homography Calibration | GUI tool allowing users to click 4 pitch corners on camera feed to compute homography matrix for custom venues. |
| `tools/demo_offline.py` | 195 | Standalone CLI Trajectory Demo | Headless demonstration script running tracking, cleaning, and delivery analysis on a sample MP4 video. |

---

## 4. Documentation & Neural Model Assets

| File Path | Size / Lines | Asset Description |
| :--- | :---: | :--- |
| `weights/tennis_ball_detector.pt` | ~6.2 MB | Pre-trained and fine-tuned YOLOv8 convolutional weights for high-speed tennis/cricket ball detection. |
| `docs/ball_analysis_results.md` | 57 lines | Benchmark report containing confusion matrix, per-class F1-scores, and error distributions. |
| `docs/ball_analysis_viva.md` | 248 lines | Comprehensive Viva Voce oral examination guide containing 20 technical questions and answers. |
| `config_calibration.json` | 2 KB | Persisted 4-point homography calibration coordinates for `default` and `behind_bowler` profiles. |
