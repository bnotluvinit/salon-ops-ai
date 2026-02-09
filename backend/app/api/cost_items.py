from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.core.db import get_session
from app.domain.models import CostItem
from typing import Optional

router = APIRouter()

@router.get("/cost-items", response_model=list[CostItem])
def get_cost_items(
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List all cost items, optionally filtered by category_id or status."""
    statement = select(CostItem)
    
    if category_id is not None:
        statement = statement.where(CostItem.category_id == category_id)
    if status is not None:
        statement = statement.where(CostItem.status == status)
    
    items = session.exec(statement).all()
    return items

@router.get("/cost-items/{item_id}", response_model=CostItem)
def get_cost_item(item_id: int, session: Session = Depends(get_session)):
    """Get a single cost item by ID."""
    statement = select(CostItem).where(CostItem.id == item_id)
    item = session.exec(statement).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Cost item not found")
    
    return item

@router.post("/cost-items", response_model=CostItem)
def create_cost_item(item: CostItem, session: Session = Depends(get_session)):
    """Create a new cost item."""
    item.id = None  # Ensure new ID
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.put("/cost-items/{item_id}", response_model=CostItem)
def update_cost_item(
    item_id: int,
    item_in: CostItem,
    session: Session = Depends(get_session)
):
    """Update an existing cost item."""
    statement = select(CostItem).where(CostItem.id == item_id)
    existing = session.exec(statement).first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Cost item not found")
    
    # Update fields
    item_data = item_in.model_dump(exclude_unset=True, exclude={"id"})
    existing.sqlmodel_update(item_data)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing

@router.delete("/cost-items/{item_id}")
def delete_cost_item(item_id: int, session: Session = Depends(get_session)):
    """Delete a cost item."""
    statement = select(CostItem).where(CostItem.id == item_id)
    item = session.exec(statement).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Cost item not found")
    
    session.delete(item)
    session.commit()
    return {"ok": True}
