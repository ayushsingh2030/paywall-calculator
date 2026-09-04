# AGENTS.md

## Run Projects

- **CatMeme-sugoiii**: `cd frontend && python -m http.server 8000` → open `http://localhost:8000`
- **Shirt project**: `cd shirt-detector/shirt-detector && pip install -r requirements.txt` → run inference via `shirt-detector` CLI

## Project Structure

### CatMeme-sugoiii
```
frontend/
  index.html      – App shell with camera, meme panels, controls
  static/         – CSS/JS assets
  frontend/script.js – Webcam, MediaPipe, matching, UI coordination
  frontend/styles.css – Layout, panel styling, responsive grid
  frontend/features.js – MediaPipe landmark conversion
  frontend/calibration.js – Gesture profiling & saving
  frontend/matching.js – Live gesture vs profile comparison
  frontend/smoothing.js – Temporal stabilization
```

### Shirt project
```
shirt-detector/
  src/
    camera.py          – Video stream capture & preprocessing
    features.py        – YOLO feature extraction
    recognizer.py      – Object detection & classification
    predictor.py       – Inference orchestration
    gui.py             – GUI state management
    inference.py       – Model loading & prediction
    train.py           – Model training (optional)
  data/
    memes/             – Reference meme images
    models/            – Trained weights
  requirements.txt     – ultralytics, torch, opencv, pyqt5, etc.
```

## Key Conventions

- **MediaPipe** (CatMeme): All vision pipelines use MediaPipe WASM for real‑time landmark detection.
- **Frontend** (CatMeme): Single‑page app served from `frontend/`; all JS lives in `frontend/script.js`.
- **Python** (Shirt): Uses Ultralytics YOLOv8; inference runs in `shirt-detector/`.
- **Dependencies**: Install via `pip install -r requirements.txt` (Shirt) or `pip install -r frontend/requirements.txt` (CatMeme).
- **Environment**: No special Docker or cloud setup required; runs locally with standard Python packages.

## Agent Gotchas

- **Webcam permissions** – Frontend must request camera access; block if denied.
- **MediaPipe WASM** – Requires a compatible browser (Chrome/Edge); fallback gracefully if unavailable.
- **Shirt detection** – Needs GPU (CUDA) for speed; CPU fallback degrades FPS.
- **Calibration** – CatMeme requires manual gesture calibration before matching works.
- **Calculator app** (separate task) should be built independently; do not mix with these repos.