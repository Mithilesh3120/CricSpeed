# CricSpeed AI: System Requirements Specification

This document details the minimal and recommended hardware and software requirements necessary to develop, deploy, and operate the **CricSpeed AI** sports analytics platform.

---

## 1. Hardware Requirements

### 1.1 Server & AI Processing Host (Computer Vision Inference)

The backend AI processing system executes YOLOv8 object detection, ByteTracker multi-object tracking, trajectory linear regression, and video transcoding.

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Processor (CPU)** | Intel Core i5 (8th Gen) or AMD Ryzen 5 (3000 series) or Apple Silicon M1 (4 physical cores) | Intel Core i7 (11th Gen+), AMD Ryzen 7 (5000 series+), or Apple Silicon M2/M3/M4 (8+ cores) |
| **Graphics (GPU / NPU)** | Integrated GPU (Intel Iris / AMD Radeon) or CPU-only inference mode | Dedicated NVIDIA GPU with CUDA (GTX 1660 / RTX 3060+ with 6GB+ VRAM) or Apple Silicon Neural Engine / Metal (MPS) |
| **System Memory (RAM)** | 8 GB DDR4 / Unified Memory | 16 GB or 32 GB LPDDR5 / DDR5 |
| **Storage** | 10 GB available SSD space (for weights, uploaded videos, temporary frames) | 50 GB NVMe PCIe SSD |
| **Camera Sensor** | USB Webcam or External Camera supporting 720p @ 30 FPS | High-framerate action camera or mirrorless camera supporting 1080p @ 60 FPS / 120 FPS |
| **Camera Mounting** | Standard tripod at minimum 1.5 m height | Heavy-duty stable tripod at 1.8 m – 2.2 m height positioned behind bowling stumps along pitch center line |
| **Network Interface** | 100 Mbps Ethernet or 802.11n Wi-Fi | 1 Gbps Gigabit Ethernet or Wi-Fi 6 (802.11ax) for low-latency RTSP camera streaming |

### 1.2 Client Machine (Web Browser & User Interface)

The web client runs as a responsive Single Page Application (SPA) utilizing HTML5 Canvas, SVG graphics rendering, and video playback.

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Device Types** | Smartphones (iOS / Android), Tablets, Laptops, Desktop PCs | Modern Laptop, iPad / Tablet, or Desktop PC |
| **Screen Resolution** | 360 × 640 pixels (Mobile portrait) | 1920 × 1080 pixels (Full HD) or higher |
| **Client RAM** | 4 GB | 8 GB+ |
| **Display Support** | CSS Flexbox/Grid, SVG rendering, HTML5 `<video>` H.264 playback | Hardware-accelerated WebGL / Canvas rendering |

---

## 2. Software Requirements

### 2.1 Server-Side Software & Environment

| Software Package | Required Version | Purpose / Role |
| :--- | :--- | :--- |
| **Operating System** | macOS 12+ (Monterey/Ventura/Sonoma/Sequoia), Ubuntu Linux 20.04/22.04 LTS, or Windows 10/11 (64-bit) | Host operating system |
| **Python Runtime** | Python 3.10 to Python 3.14 (Validated on Python 3.14.2) | Primary backend runtime environment |
| **PyTorch** | Version 2.0+ (Installed: `torch==2.13.0`, `torchvision==0.28.0`) | Neural network inference for YOLOv8 |
| **OpenCV** | `opencv-python==5.0.0.93` | Video decoding, image preprocessing, homography, and HUD drawing |
| **Ultralytics** | `ultralytics==8.4.103` | YOLOv8 neural network wrapper and weights loader |
| **Web Server** | `Flask==3.1.3`, `Werkzeug==3.1.8`, `Flask-CORS==4.0.0` | WSGI application server and RESTful routing |
| **Transcoding Utilities**| FFmpeg CLI (`ffmpeg` command-line utility with `libx264` or `h264_videotoolbox`) | High-speed video remuxing and H.264 browser compatibility |
| **Relational Database**| SQLite 3 (Bundled with standard Python library) | Embedded ACID-compliant database for match scorecards |
| **Document Database**  | MongoDB Community Server 6.0+ (or MongoDB Atlas Cloud) | Fast time-series speed radar record storage |

### 2.2 Client-Side Software & Environment

| Software Package | Required Version | Purpose / Role |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node.js 18.x LTS or 20.x LTS | Frontend build environment |
| **Package Manager** | npm 9.x+ or pnpm 8.x+ or yarn 1.22+ | Dependency manager |
| **Vite Bundler** | `vite==5.4.11` | Next-generation frontend tooling and HMR dev server |
| **React Framework** | `react==19.2.8`, `react-dom==19.2.8` | Declarative UI rendering |
| **Icons Library** | `lucide-react==1.47.0` | Feather-based lightweight SVG vector iconography |
| **Modern Web Browser** | Google Chrome 90+, Mozilla Firefox 88+, Apple Safari 14+, or Microsoft Edge 90+ | Web standards execution (ES6+, CSS Grid, SVG, Fetch API) |

---

## 3. Configuration & Environment Variables

The backend application is configured through `config.py` with optional overrides through system environment variables:

```bash
# Server Port and Host
HOST=0.0.0.0
PORT=5050
DEBUG=True

# Database Configuration
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=cricspeed

# Computer Vision & Detection Thresholds
YOLO_CONF_HIGH=0.40
YOLO_CONF_LOW=0.15
YOLO_IOU=0.40
YOLO_IMGSZ=640

# Ball Movement Analysis Parameters
ENABLE_BALL_ANALYSIS=True
TURN_MIN_DEG=1.5
SWING_MIN_M=0.05
SPIN_SPEED_MAX=110.0
LOST_FRAMES_N=8
OVERLAY_HOLD_SECONDS=4.0
ANALYSIS_MAX_AGE_SECONDS=60.0
MIN_TRACK_POINTS=6
MIN_PITCH_SPAN_M=3.0
```

---

## 4. Hardware Setup Guidelines for Accurate Capture

To maximize computer vision accuracy and avoid parallax error, the physical deployment must follow standard guidelines:

```
                  [ Stumps (Bowler End) ]
                           |
                           |  Pitch Length = 20.12 m (22 yards)
                           |
                  [ Stumps (Batter End) ]
                           |
                           v
               [ Elevated Camera Tripod ]
                   (Height: 1.8 - 2.2 m)
                   (Distance: 2 - 4 m behind bowler)
                   (Angle: 0° directly aligned with pitch axis)
```

1. **Elevation**: The camera lens must be at least 1.8 m high to maintain an unobstructed line-of-sight over the bowler's shoulder.
2. **Alignment**: The camera must be aligned with the center stump line to ensure symmetric lateral deviation measurements.
3. **Lighting**: Uniform ambient daylight or floodlights ($\ge 500\text{ lux}$) without sharp flickering are required to minimize motion blur.
