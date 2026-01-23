from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.db import get_session
from app.domain.models import FixedCosts, OperationalInputs, FinancialSnapshot
from app.domain.logic import calculate_forecast
from app.core.security import get_current_username

router = APIRouter(dependencies=[Depends(get_current_username)])

@router.post("/forecast", response_model=FinancialSnapshot)
def get_forecast(inputs: OperationalInputs, session: Session = Depends(get_session)):
    # 1. Fetch Fixed Costs
    statement = select(FixedCosts).limit(1)
    costs = session.exec(statement).first()
    if not costs:
        # If no costs configured, use defaults (zeros)
        costs = FixedCosts()
        
    # 2. Run Domain Logic
    snapshot = calculate_forecast(inputs, costs)
    
    return snapshot
