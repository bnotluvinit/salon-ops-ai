from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.db import get_session
from app.domain.models import FixedCosts
from app.core.security import get_current_username

router = APIRouter(dependencies=[Depends(get_current_username)])

@router.get("/costs", response_model=FixedCosts)
def get_costs(session: Session = Depends(get_session)):
    # Simple singleton pattern: always get the first row, or return default
    statement = select(FixedCosts).limit(1)
    costs = session.exec(statement).first()
    if not costs:
        # Return default 0s if not set yet, but don't persist it implicitly?
        # Better to return a default object.
        return FixedCosts()
    return costs

@router.post("/costs", response_model=FixedCosts)
def update_costs(costs_in: FixedCosts, session: Session = Depends(get_session)):
    statement = select(FixedCosts).limit(1)
    existing_costs = session.exec(statement).first()
    
    if existing_costs:
        # Update existing
        costs_data = costs_in.model_dump(exclude_unset=True, exclude={"id"})
        existing_costs.sqlmodel_update(costs_data)
        session.add(existing_costs)
        session.commit()
        session.refresh(existing_costs)
        return existing_costs
    else:
        # Create new
        costs_in.id = None # Ensure new ID
        session.add(costs_in)
        session.commit()
        session.refresh(costs_in)
        return costs_in
