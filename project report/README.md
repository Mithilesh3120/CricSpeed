# CricSpeed AI: College Mini-Project Report Package

Welcome to the official technical documentation and academic mini-project report for **CricSpeed AI** (Computer Vision & AI-Powered Cricket Bowling Speed Radar & Movement Analytics System).

This directory contains the complete academic project report, architectural diagrams, data dictionaries, test suites, and technical references prepared for academic submission, project evaluation, and viva examination.

---

## Document Directory & Navigation

All files have been curated and generated inside the `project report` directory to preserve clean separation from application source code.

| Document | File Name | Description |
| :--- | :--- | :--- |
| **Complete Project Report** | [`MINI_PROJECT_REPORT_CONTENT.md`](./MINI_PROJECT_REPORT_CONTENT.md) | Full 6-chapter formal academic report (Chapters 1 to 6 + Appendices) following college engineering format. |
| **Executive Fact Sheet** | [`PROJECT_FACT_SHEET.md`](./PROJECT_FACT_SHEET.md) | High-level summary of system metrics, tech stack versions, core algorithms, and current implementation status. |
| **System Diagrams** | [`SYSTEM_DIAGRAMS.md`](./SYSTEM_DIAGRAMS.md) | Complete Mermaid diagrams (Architecture, Use Case, Class, Sequence, Activity, ERD) with full explanations. |
| **Database Documentation** | [`DATABASE_DOCUMENTATION.md`](./DATABASE_DOCUMENTATION.md) | Data dictionary and schemas for SQLite (`scorecard.db`) and MongoDB (`cricspeed`), indexes, and sample queries. |
| **Test Cases & Verification** | [`TEST_CASES.md`](./TEST_CASES.md) | Automated pytest suite results (15/15 passed), synthetic benchmark evaluation (100% accuracy, 0.20° MAE), and test matrices. |
| **Source File Inventory** | [`SOURCE_FILE_INVENTORY.md`](./SOURCE_FILE_INVENTORY.md) | Exhaustive file-by-file codebase inventory detailing line counts, roles, classes, functions, and dependencies. |
| **System Requirements** | [`SYSTEM_REQUIREMENTS.md`](./SYSTEM_REQUIREMENTS.md) | Hardware and software specifications (minimum vs recommended), runtime environments, and OS support. |
| **Academic & Tech References** | [`REFERENCES.md`](./REFERENCES.md) | Complete list of formal academic citations (IEEE, CVPR, Springer), official software manuals, and MCC Cricket Laws. |

---

## Project Overview

**CricSpeed AI** is an advanced, non-intrusive cricket analytics platform that replaces expensive multi-camera commercial radar systems (such as Hawk-Eye) with a single-camera monocular computer vision pipeline. Using deep learning and geometric computer vision, it achieves:
1. **Real-time Bowling Speed Estimation**: Sub-pixel trajectory tracking calculating delivery release and pitch speeds in km/h.
2. **Trajectory & Movement Analytics**: Automatic bounce inflection point detection, pre- and post-bounce linear regression trajectory fitting, turn angle measurement ($\Delta \theta$), lateral swing measurement (in cm), and pitch length/line classification.
3. **Batter Handedness Adaptation**: Dynamic coordinate inversion supporting both Right-Hand Batsmen (RHB) and Left-Hand Batsmen (LHB) to classify Off-Spin, Leg-Spin, Inswing, and Outswing accurately.
4. **Dual-Database Architecture**: Fast document logging via MongoDB for radar speed records, combined with an ACID-compliant, thread-safe SQLite database powering a live cricket scorecard engine.
5. **Dark Glassmorphic Web Interface**: Responsive React 19 SPA featuring top-down interactive SVG pitch mapping, ball-by-ball tracking, video upload with progress polling, and automated HUD video annotations.

---

## How to Verify the Implementation

To independently verify the test suite and execution described in this report:

1. **Activate Python Virtual Environment**:
   ```bash
   cd /Users/dinesh/Documents/CricSpeedAI
   source venv/bin/activate
   ```

2. **Run the Automated Delivery Analysis Test Suite**:
   ```bash
   pytest tests/test_delivery_analysis.py -v
   ```
   *Expected Output: 15 passed in ~6 seconds.*

3. **Run the Synthetic Trajectory Benchmark**:
   ```bash
   python tools/evaluate_analysis.py
   ```
   *Expected Output: 13/13 passed (100.0% accuracy, MAE 0.20°).*

4. **Verify Frontend Build**:
   ```bash
   cd frontend
   npm run build
   ```
   *Expected Output: Successful Vite production bundle in `frontend/dist/`.*

---

## Academic Integrity & Authorship Note

This report has been compiled from the actual, working source code of the CricSpeed AI project. All mathematical formulas, database table structures, API endpoints, and test results correspond directly to the codebase and have been verified against active files. No external mock data or non-existent features have been fabricated.
