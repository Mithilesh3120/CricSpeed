# CricSpeed AI: Formal Academic & Technical References

## 1. Academic Papers & Computer Vision Research

1. **Redmon, J., Divvala, S., Girshick, R., & Farhadi, A.** (2016). *You Only Look Once: Unified, Real-Time Object Detection*. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), pp. 779-788.
   - Foundation of single-stage real-time convolutional object detection utilized by YOLO architectures.

2. **Jocher, G., Chaurasia, A., & Qiu, J.** (2023). *Ultralytics YOLOv8: Real-Time Object Detection and Image Segmentation Engine*. GitHub Repository: `https://github.com/ultralytics/ultralytics`.
   - Architectural framework for the tennis ball detection backbone (`weights/tennis_ball_detector.pt`) applied in CricSpeed AI.

3. **Zhang, Y., Sun, P., Jiang, Y., Yu, D., Weng, F., Yuan, Z., Luo, P., Liu, W., & Wang, X.** (2022). *ByteTrack: Multi-Object Tracking by Associating Every Detection Box*. In European Conference on Computer Vision (ECCV), pp. 1-21. Springer, Cham.
   - Two-stage association algorithm that preserves low-score bounding boxes to maintain continuity of ball tracking through motion blur and partial occlusion.

4. **Kalman, R. E.** (1960). *A New Approach to Linear Filtering and Prediction Problems*. Journal of Basic Engineering, 82(1), pp. 35-45.
   - Mathematical formulation for recursive state estimation in discrete spatial coordinate filtering.

5. **Hartley, R., & Zisserman, A.** (2004). *Multiple View Geometry in Computer Vision* (2nd ed.). Cambridge University Press.
   - Theoretical basis for 2D planar homography transformations, perspective projection matrices, and camera-to-ground calibration.

6. **Fischler, M. A., & Bolles, R. C.** (1981). *Random Sample Consensus: A Paradigm for Model Fitting with Applications to Image Analysis and Automated Cartography*. Communications of the ACM, 24(6), pp. 381-395.
   - Robust estimation technique underpinning outlier rejection in trajectory coordinates.

7. **Rao, C. R.** (1973). *Linear Statistical Inference and Its Applications* (2nd ed.). John Wiley & Sons.
   - Foundation of ordinary least squares linear regression applied for pre-bounce and post-bounce trajectory angle estimation.

8. **Rennie, C., & Armstrong, S.** (2018). *Computer Vision in Sports Ball Tracking: Challenges and Innovations in Monocular Systems*. International Journal of Computer Science in Sport, 17(2), pp. 142-168.
   - Survey of single-camera optical tracking techniques vs. multi-camera stereo rigs in professional cricket.

---

## 2. Official Rules & Sports Standards

9. **Marylebone Cricket Club (MCC).** (2017 Code, 3rd Edition - 2022). *The Laws of Cricket*. Lord’s Ground, London, UK.
   - **Law 6**: The Pitch (Dimensions: 22 yards / 20.12 m length, 10 feet / 3.05 m width).
   - **Law 7**: The Creases (Popping crease at 4 ft / 1.22 m from bowling crease, return creases).
   - **Law 8**: The Wickets (Stump spacing and height: 28 inches / 71.12 cm).
   - **Law 21**: No Ball (Bowling crease overstepping and height infringements).
   - **Law 22**: Wide Ball (Ball passing wide of the striker's wicket).

10. **International Cricket Council (ICC).** (2023). *Standard Playing Conditions for Men's and Women's International Matches*. ICC Development (International) Ltd, Dubai, UAE.

---

## 3. Software Frameworks & Technical Documentation

11. **OpenCV Development Team.** (2024). *OpenCV Open Source Computer Vision Library (v5.0)*. Documentation: `https://docs.opencv.org/`.
    - Image filtering, contour handling, homography perspective warping, and OpenCV HUD rendering.

12. **Paszke, A., Gross, S., Massa, F., Lerer, A., et al.** (2019). *PyTorch: An Imperative Style, High-Performance Deep Learning Library*. In Advances in Neural Information Processing Systems (NeurIPS 32), pp. 8024-8035.
    - Neural tensor execution framework for GPU/MPS acceleration.

13. **Pallets Projects.** (2024). *Flask Documentation (Release 3.1.x)*. Pallets Community: `https://flask.palletsprojects.com/`.
    - Microframework architecture, WSGI streaming response protocols, and RESTful routing.

14. **React Documentation Core Team.** (2024). *React: A JavaScript Library for Building User Interfaces (v19)*. Meta Open Source: `https://react.dev/`.
    - Declarative state management, component lifecycles, and Virtual DOM reconciliation.

15. **Vite Core Team.** (2024). *Vite: Next Generation Frontend Tooling (v5)*. Available at: `https://vitejs.dev/`.
    - Native ES modules bundler and Rollup-powered production packaging.

16. **SQLite Development Team.** (2024). *SQLite Architecture and SQL Documentation*. Available at: `https://www.sqlite.org/docs.html`.
    - Serverless, transactional SQL database engine with ACID compliance.

17. **MongoDB Inc.** (2024). *MongoDB Manual (Version 6.0 / 7.0)*. MongoDB Inc: `https://www.mongodb.com/docs/manual/`.
    - High-throughput document-oriented database architecture and BSON serialization.

18. **W3C Scalable Vector Graphics (SVG) Working Group.** (2018). *Scalable Vector Graphics (SVG) 2 Specification*. W3C Recommendation: `https://www.w3.org/TR/SVG2/`.
    - Declarative 2D vector graphics standard utilized by the responsive pitch map component.
