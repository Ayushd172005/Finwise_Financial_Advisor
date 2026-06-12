# 💰 FinWise — Personal Finance AI Advisor

> An intelligent personal finance assistant powered by Claude AI. Track expenses, plan budgets, set goals, and get personalized investment advice — all in one place.

![FinWise Screenshot](docs/screenshot.png)

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Expense Analysis** | Track and categorize spending with visual breakdowns |
| 🎯 **Budget Planning** | Set category limits with 50/30/20 rule guidance |
| 💹 **Investment Suggestions** | Personalized options (SIP, FD, Stocks) by risk profile |
| 🏆 **Goal Tracking** | Create and monitor financial goals with deadlines |
| 🤖 **AI Chat Advisor** | Real-time conversational finance guidance via Claude |
| 📈 **AI Deep Analysis** | One-click financial health report with action items |

## 🛠 Tech Stack

**Backend**
- FastAPI (Python)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Pydantic v2

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (data visualization)
- Lucide React (icons)

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/finance-advisor.git
cd finance-advisor
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start the server
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
finance-advisor/
├── backend/
│   ├── main.py              # FastAPI app with all routes
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Overview + AI analysis
│   │   │   ├── Expenses.jsx    # Transaction management
│   │   │   ├── Budget.jsx      # Budget limits + AI suggestions
│   │   │   ├── Goals.jsx       # Goal tracking
│   │   │   ├── Invest.jsx      # Investment options
│   │   │   └── Chat.jsx        # AI chat advisor
│   │   ├── hooks/
│   │   │   └── useFinanceStore.js  # Global state
│   │   ├── utils/
│   │   │   └── api.js          # API calls
│   │   └── styles/
│   │       └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Deep AI financial analysis |
| `POST` | `/api/chat` | Conversational AI advisor |
| `POST` | `/api/budget-suggestions` | AI budget recommendations |
| `GET` | `/api/investment-options` | Personalized investment options |
| `GET` | `/api/health` | Health check |

## 🔧 Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
```

## 📝 License

MIT License — feel free to use and modify.

---
Built with ❤️ using Claude AI by Anthropic
