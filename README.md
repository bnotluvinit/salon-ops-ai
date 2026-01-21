# Salon Operations & Financial Forecasting Dashboard

A production-quality full-stack application designed to help salon owners model daily operations and forecast monthly financial outcomes. This decision-support tool transforms operational inputs (haircuts, pricing, staffing) into financial insights (revenue, labor costs, profit, and risk flags).

## 🚀 Key Features

### 1. Fixed Costs Management
-   **Configuration**: Persist monthly fixed expenses such as Rent, Insurance, Utilities, Software, and Debt Service.
-   **Persistence**: Data is saved to a SQLite database to ensure configuration is retained between sessions.

### 2. Financial Forecasting Engine
-   **Scenario Modeling**: Input operational assumptions:
    -   Daily Volume (Haircuts per day)
    -   Pricing Strategy (Price per cut)
    -   Staffing (Number of stylists, hours per day, hourly rate)
    -   Operating Schedule (Days open per month)
-   **Real-Time Calculations**: Instantly computes:
    -   **Revenue**: Daily and Monthly projections.
    -   **Costs**: Labor costs (variable) vs. Fixed costs.
    -   **Profitability**: Gross Margin, Net Profit, and Profit Margin %.
    -   **KPIs**: Revenue per stylist hour, Labor % of Revenue.

### 3. Risk Analysis
-   **Automated Risk Flags**: The system automatically detects and flags potential financial risks:
    -   🚨 **Negative Cash Flow**: When expenses exceed revenue.
    -   ⚠️ **High Labor Cost**: When labor exceeds 45% of revenue.
    -   ⚠️ **Low Margin**: When net profit margin drops below 10%.
-   **Visual Indicators**: Clear Red/Yellow/Green badges provide instant health checks.

---

## 🛠 Technology Stack

### Backend
-   **Python 3.12**: Core runtime.
-   **FastAPI**: High-performance API framework.
-   **SQLModel**: Database abstraction (SQLAlchemy + Pydantic).
-   **Poetry**: Dependency management.
-   **SQLite**: Local file-based database.
-   **Domain-Driven Design**: Business logic is isolated from the API layer.

### Frontend
-   **React 19**: UI Library.
-   **TypeScript**: Type safety sharing models with the backend.
-   **Vite**: Next-generation build tool.
-   **Tailwind CSS v4**: Utility-first styling with a premium "Slate" dark theme.

### Infrastructure
-   **Docker**: Containerized environment for consistent development and deployment.
-   **Docker Compose**: Orchestrates the multi-container setup.

---

## 🏁 Getting Started

### Option A: Docker (Recommended)

Run the entire stack with a single command:

```bash
docker compose up --build
```

-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Local Development

#### Backend
1.  Navigate to the backend: `cd backend`
2.  Install dependencies: `poetry install`
3.  Run the server: `poetry run uvicorn app.main:app --reload`

#### Frontend
1.  Navigate to the frontend: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run the dev server: `npm run dev`

---

## 📸 Usage Guide

1.  **Configure Costs**:
    -   Navigate to the **Fixed Costs** tab.
    -   Enter your monthly expenses (e.g., Rent: $2000, Utilities: $300).
    -   Click **Save Configuration**.

2.  **Run Forecast**:
    -   Switch to the **Forecasting** tab.
    -   Adjust the sliders/inputs for **Operational Assumptions**.
    -   Click **Run Forecast**.
    -   Review the **Revenue & Costs** and **Profitability & Risk** cards to see the projected financial health.

---

## 🧪 Architecture

The project follows a **Domain-First** architecture:

-   `backend/app/domain/logic.py`: Contains pure Python functions for financial calculations and risk assessment.
-   `backend/app/api/`: Thin wrappers that handle HTTP requests and delegate to the domain logic.
-   `frontend/src/features/`: React components grouped by business domain (Costs, Forecast).
