# Corporate Risk Assessment System

A professional AI-powered dashboard for corporate bankruptcy prediction and financial stress testing. This project features two modes of operation:

1. **Standalone Streamlit Dashboard**: For rapid analysis and prototyping.
2. **Full Stack Web Application**: A React frontend + Flask backend for a complete product experience.


For Single Company
<img width="1920" height="2488" alt="image" src="https://github.com/user-attachments/assets/ce76635a-37cd-441c-8995-a18b91bd27c0" />

<img width="1920" height="2488" alt="image" src="https://github.com/user-attachments/assets/ce10b43a-cb55-42a5-a7f1-31e8dba1e5d5" />

For Multiple Companies
<img width="1920" height="1646" alt="image" src="https://github.com/user-attachments/assets/9fd850b7-cca6-411d-a092-d7386443f1bc" />



## Project Structure

- **`app.py`**: Standalone Streamlit application.
- **`backend/`**: Flask REST API handling inference and data processing.
- **`frontend/`**: Modern React/Vite dashboard communicating with the backend.
- **`tests/`**: Sample datasets for portfolio testing.

## Prerequisites

- **Python 3.10+** (managed via `uv` or `pip`)
- **Node.js 18+** & **npm** (for the frontend)
- **uv** (Recommended for fast Python dependency management)

```bash
# Install uv if needed
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Quick Start: Full Stack App

To run the complete application (Frontend + Backend) in one go, you can use the provided helper script or follow the manual steps below.

### One-Command Start

We have provided a convenience script to set up and run everything:

```bash
./run_full_stack.sh
```

### Manual Setup

#### 1. Backend Setup

Initialize the Python environment and start the Flask API.

```bash
cd backend
uv venv --python 3.10  # or python3 -m venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt  # or pip install -r requirements.txt
python app.py
```

_The backend will start on http://localhost:5000_

#### 2. Frontend Setup

In a new terminal window, set up and run the React application.

```bash
cd frontend
npm install
npm run dev
```

_The frontend will start on http://localhost:3000_

---


## Alternative: Streamlit Dashboard

If you prefer the standalone Python dashboard without the React frontend:

1. **Setup Environment**

   ```bash
   uv venv --python 3.10
   source .venv/bin/activate
   uv pip install -r requirements.txt
   ```

2. **Run Dashboard**
   ```bash
   streamlit run app.py
   ```

```bash
streamlit run app.py
```

### workflows

1.  **Single Company Simulator**: Adjust financial sliders (Borrowing Dependency, Net Worth, etc.) to see real-time risk predictions and SHAP explanations.
2.  **Batch Portfolio Audit**: Switch to the "Batch Portfolio Audit" tab to upload a CSV file and scan hundreds of companies automatically. Use the provided "Download Template" feature to ensure your data format is correct.

## Tech Stack

- **Frontend**: Streamlit
- **ML Core**: Scikit-learn (Random Forest)
- **Explainability**: SHAP (SHapley Additive exPlanations)
- **Data Processing**: Pandas, NumPy
