# CricSpeed AI: Project Fact Sheet

## 1. Executive Summary

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **CricSpeed AI** |
| **Subtitle** | Computer Vision & AI-Powered Cricket Bowling Speed Radar & Movement Analytics System |
| **Domain** | Computer Vision, Artificial Intelligence, Sports Analytics, Full-Stack Web Systems |
| **Target Sport** | Cricket (Bowling Trajectory, Speed Radar, Movement Classification & Match Scoring) |
| **Primary Goal** | Provide accessible, single-camera broadcast-grade speed radar, ball movement analytics (spin turn, seam swing, pitch length/line), and digital scorekeeping without proprietary high-cost multi-camera hardware. |
| **Deployment Model** | Local / Edge Hybrid (Local Python Flask Backend + Modern React SPA) |
| **Status** | Fully Functional, Tested, and Production-Built |

---

## 2. Technology Stack & Exact Versions

### Backend & AI Engine
- **Runtime**: Python 3.14.2 (Virtual Environment: `./venv`)
- **Web Framework**: Flask 3.1.3 (WSGI Server, CORS-enabled via Flask-CORS)
- **Computer Vision**: OpenCV (`opencv-python` 5.0.0.93)
- **Deep Learning Inference**: PyTorch 2.13.0, Torchvision 0.28.0
- **Object Detection Model**: Ultralytics YOLOv8 8.4.103 (`weights/tennis_ball_detector.pt`)
- **Tracking Algorithm**: Custom ByteTracker implementation with Kalman Filtering (`ai/tracker.py`)
- **Numerical Computation**: NumPy 2.5.1, SciPy 1.18.0, Pandas 3.0.3, Polars 1.43.0
- **Testing Framework**: Pytest 8.x (`tests/test_delivery_analysis.py`)

### Frontend Web Client
- **Core Library**: React 19.2.8 (`react`, `react-dom`)
- **Build Tool / Bundler**: Vite 5.4.11 (`@vitejs/plugin-react` 4.3.3)
- **Linter**: Oxlint 1.81.0
- **Iconography**: Lucide React 1.47.0
- **Styling Architecture**: Dark Glassmorphic Design System (`#050811` base, `#0d1424` card surface, `#00f2fe` cyan, `#ffab00` amber, `#00e676` emerald, `#ff1744` crimson)
- **Responsive Target**: 360px mobile viewport up to 4K desktop displays

### Database Systems (Dual Hybrid Architecture)
- **Relational Match Store**: SQLite 3 (`database/scorecard.db`)
  - Schema: `matches`, `batting_scorecard`, `bowling_scorecard`, `ball_by_ball` (with extended ball analytics columns)
  - Concurrency: Thread-safe connection pooling with `timeout=20.0`
- **Time-Series Radar Store**: MongoDB (`cricspeed` database, `runs` collection)
  - Driver: PyMongo 4.17.0
  - Schema: Sequence `id`, `speed` (float), `status` (text), `timestamp` (string)

---

## 3. Core Algorithms & Mathematical Models

1. **Object Detection**:
   - YOLOv8 lightweight detector tuned for high recall on high-velocity sports balls.
   - Dual-threshold confidence gating: $\text{conf}_{\text{high}} = 0.40$, $\text{conf}_{\text{low}} = 0.15$ with $\text{IoU} = 0.40$.
2. **Multi-Object Association**:
   - ByteTrack two-stage data association using Kalman filter spatial prediction and Hungarian matching.
3. **Trajectory Smoothing & Track Cleaning**:
   - Median Absolute Deviation (MAD) outlier rejection on inter-frame pixel velocities.
   - Up to 2-frame linear interpolation for occluded ball coordinates.
   - Forward-motion filtering: Rejects reverse return throws and truncates trajectory at batsman contact/rebound.
4. **Inflection-Based Bounce Detection**:
   - Detects the transition where downward vertical velocity changes sign ($\dot{y} > 0 \to \dot{y} \le 0$).
   - Validates bounce window within expected pitch region ($4.0\text{ m} \le y \le 18.0\text{ m}$).
5. **Turn Angle & Swing Deviation Calculation**:
   - Independent linear regressions on pre-bounce and post-bounce trajectories:
     $$\theta = \arctan(m)$$
     $$\Delta \theta = |\theta_{\text{post}} - \theta_{\text{pre}}|$$
   - Lateral swing calculated as maximum deviation of pre-bounce trajectory from straight release-to-bounce line:
     $$\text{swing}_{\text{cm}} = \max_i |x_i - (m_{\text{ref}} \cdot y_i + c_{\text{ref}})| \times 100$$
6. **Handedness Coordinate Inversion**:
   - Dynamic classification adjustment based on batsman stance (Right-Hand Batsman vs. Left-Hand Batsman):
     - $\Delta x > 0$: Turns into RHB (Off-Spin) / Away from LHB (Leg-Spin).
     - $\Delta x < 0$: Turns away from RHB (Leg-Spin) / Into LHB (Off-Spin).
7. **Speed Estimation**:
   - Pixel displacement over inter-frame time $\Delta t = 1 / \text{fps}$.
   - Exponential Moving Average (EMA) smoothing ($\alpha = 0.75$):
     $$v_t = \alpha \cdot v_{\text{instant}} + (1 - \alpha) \cdot v_{t-1}$$
   - Perspective Homography pitch transformation via 4 calibrated ground control points (Bowler Crease to Popping Crease: $20.12\text{ m} \times 3.05\text{ m}$).

---

## 4. Key Metrics & Benchmarks

| Metric | Measured Value | Verification Source |
| :--- | :--- | :--- |
| **Unit Test Passing Rate** | **100% (15/15 passed)** | `pytest tests/test_delivery_analysis.py` |
| **Benchmark Delivery Classification** | **100.0% (13/13 passed)** | `tools/evaluate_analysis.py` |
| **Turn Angle Mean Absolute Error (MAE)** | **0.20°** | Evaluated against synthetic trajectory dataset |
| **Turn Angle Root Mean Square Error (RMSE)** | **0.23°** | Evaluated against synthetic trajectory dataset |
| **Precision / Recall / F1-Score** | **1.00 / 1.00 / 1.00** across all 5 classes (`OFF_SPIN`, `LEG_SPIN`, `INSWING`, `OUTSWING`, `STRAIGHT`) | `docs/ball_analysis_results.md` |
| **Backend Code Size** | 3,619 lines across 13 Python modules | `wc -l app.py database/*.py ai/*.py` |
| **Frontend Code Size** | 5,184 lines across 15 React/CSS modules | `wc -l frontend/src/*.jsx frontend/src/components/*.jsx` |
| **API Endpoints** | 26 distinct RESTful / streaming routes | Flask `app.py` |
| **Video Processing Codec** | H.264 / MP4 (`h264_videotoolbox` hardware accel on macOS, fallback `libx264`) | `ai/video_processor.py` |

---

## 5. System Features & Workflows

### Implemented & Verified Capabilities
- **Live Camera AI Radar**: Real-time video streaming with live visual trail overlays, instant speed readout, delivery type badge, and batsman hand toggle.
- **Automated HUD Delivery Overlay**: Dynamic OpenCV drawing showing pre-bounce path (emerald), post-bounce path (crimson), bounce impact circle (amber), and delivery breakdown banner.
- **Offline Video Analyzer**: Drag-and-drop video upload supporting multi-delivery segmentation, progress polling (`/api/upload/status`), interactive pitch map selection, and direct annotated MP4 download.
- **Complete Cricket Scorecard Engine**: Official match setup (teams, overs, toss), live scoring (runs, extras, wickets, maidens, overs), automatic strike rotation, ball-by-ball delivery analysis attachment, and single-click undo.
- **Bowler Performance Analytics**: Aggregated bowler metrics (average turn angle, average swing, spin vs. swing ratios, length distribution charts, match pitch maps).
- **Interactive Pitch Map (SVG)**: Responsive 22-yard pitch graphic rendering color-coded bounce points with clickable delivery inspection.

### Known Boundaries & Constraints
- **Camera Stance Dependency**: Optimal accuracy requires an elevated tripod perspective (height $\ge 1.8\text{ m}$) placed directly behind the bowler along the pitch center line.
- **Monocular Depth Limitations**: Vertical bounce height is inferred from 2D pixel trajectory inflection rather than calibrated 3D stereo vision.
- **Framerate Sensitivity**: High delivery speeds ($>120\text{ km/h}$) recorded below 30 fps exhibit motion blur, reducing the number of valid trajectory sample points.
