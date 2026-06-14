from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime, date
from anthropic import Anthropic

app = FastAPI(title="Personal Finance AI Advisor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# ── Models ──────────────────────────────────────────────────────────────────
class Expense(BaseModel):
    id: Optional[str] = None
    amount: float
    category: str
    description: str
    date: str

class Budget(BaseModel):
    category: str
    limit: float
    period: str = "monthly"

class Goal(BaseModel):
    id: Optional[str] = None
    name: str
    target_amount: float
    current_amount: float
    deadline: str
    priority: str = "medium"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    financial_context: Optional[dict] = None

class AnalysisRequest(BaseModel):
    expenses: List[Expense]
    budgets: Optional[List[Budget]] = []
    goals: Optional[List[Goal]] = []
    income: Optional[float] = None

# ── Finance Analysis Routes ──────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze_finances(req: AnalysisRequest):
    """Deep AI analysis of user's financial data."""
    total_expenses = sum(e.amount for e in req.expenses)
    categories: dict = {}
    for e in req.expenses:
        categories[e.category] = categories.get(e.category, 0) + e.amount

    context = f"""
User Financial Summary:
- Total Expenses: ${total_expenses:.2f}
- Monthly Income: ${req.income or 0:.2f}
- Savings Rate: {((req.income - total_expenses) / req.income * 100) if req.income and req.income > 0 else 0:.1f}%
- Expense Breakdown: {json.dumps(categories, indent=2)}
- Budget Limits: {json.dumps([b.dict() for b in req.budgets], indent=2)}
- Financial Goals: {json.dumps([g.dict() for g in req.goals], indent=2)}
"""

    prompt = f"""You are an expert personal finance advisor. Analyze this financial data and provide:
1. Key spending insights (3-4 bullet points)
2. Budget health assessment
3. Top 3 actionable recommendations
4. Investment suggestion based on savings capacity
5. Goal feasibility analysis

{context}

Respond in JSON format:
{{
  "insights": ["insight1", "insight2", "insight3"],
  "budget_health": "good|warning|critical",
  "budget_score": 0-100,
  "recommendations": [
    {{"title": "...", "description": "...", "impact": "high|medium|low", "category": "..."}}
  ],
  "investment_suggestion": {{"type": "...", "reason": "...", "monthly_amount": 0, "expected_return": "..."}},
  "goal_analysis": [{{"goal": "...", "feasibility": "on_track|at_risk|off_track", "advice": "..."}}],
  "monthly_summary": {{"surplus_deficit": 0, "biggest_expense_category": "...", "savings_potential": 0}}
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text
    # strip markdown fences if present
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return JSONResponse(content=json.loads(text.strip()))


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Conversational AI financial advisor."""
    system_prompt = """You are a friendly, knowledgeable personal finance AI advisor named 'FinBot'. 
You help users with:
- Budgeting and expense management
- Investment strategies (stocks, mutual funds, SIPs, FDs for Indian users)
- Debt management
- Tax planning tips
- Financial goal setting
- Emergency fund planning

Keep responses concise (2-4 paragraphs max), use bullet points for lists,
and always be encouraging yet realistic. If given financial context, reference it specifically."""

    if req.financial_context:
        system_prompt += f"\n\nUser's Current Financial Snapshot:\n{json.dumps(req.financial_context, indent=2)}"

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=messages
    )

    return {"reply": response.content[0].text}


@app.post("/api/budget-suggestions")
async def budget_suggestions(req: AnalysisRequest):
    """Generate AI-powered budget recommendations."""
    total = sum(e.amount for e in req.expenses)
    cats: dict = {}
    for e in req.expenses:
        cats[e.category] = cats.get(e.category, 0) + e.amount

    prompt = f"""Based on these expenses (total: ${total:.2f}, income: ${req.income or 0}):
{json.dumps(cats, indent=2)}

Suggest an optimal budget plan using the 50/30/20 rule adapted to actual spending.
Return JSON:
{{
  "suggested_budgets": [
    {{"category": "...", "suggested_limit": 0, "current_spend": 0, "reasoning": "..."}}
  ],
  "rule_breakdown": {{"needs": 0, "wants": 0, "savings": 0}},
  "key_adjustments": ["adjustment1", "adjustment2"]
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return JSONResponse(content=json.loads(text.strip()))


@app.get("/api/investment-options")
async def get_investment_options(monthly_savings: float = 5000, risk_profile: str = "moderate"):
    """Get personalized investment options based on savings."""
    prompt = f"""For someone with ₹{monthly_savings}/month to invest and a {risk_profile} risk profile, 
suggest 4 investment options popular in India. Return JSON:
{{
  "options": [
    {{
      "name": "...", 
      "type": "...",
      "expected_return": "...",
      "risk_level": "low|medium|high",
      "min_investment": 0,
      "suitable_for": "...",
      "pros": ["...", "..."],
      "cons": ["...", "..."],
      "how_to_start": "..."
    }}
  ],
  "allocation_suggestion": {{"option_name": "percentage"}},
  "disclaimer": "..."
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return JSONResponse(content=json.loads(text.strip()))


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Personal Finance AI Advisor"}
