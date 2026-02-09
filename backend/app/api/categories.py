from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.db import get_session
from app.domain.models import CostCategory

router = APIRouter()

@router.get("/categories", response_model=list[CostCategory])
def get_categories(session: Session = Depends(get_session)):
    """List all cost categories, ordered by sort_order."""
    statement = select(CostCategory).order_by(CostCategory.sort_order)
    categories = session.exec(statement).all()
    return categories

@router.post("/categories", response_model=CostCategory)
def create_category(category: CostCategory, session: Session = Depends(get_session)):
    """Create a new cost category."""
    category.id = None  # Ensure new ID
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.put("/categories/{category_id}", response_model=CostCategory)
def update_category(
    category_id: int,
    category_in: CostCategory,
    session: Session = Depends(get_session)
):
    """Update an existing cost category."""
    statement = select(CostCategory).where(CostCategory.id == category_id)
    existing = session.exec(statement).first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields
    category_data = category_in.model_dump(exclude_unset=True, exclude={"id"})
    existing.sqlmodel_update(category_data)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session)):
    """Delete a cost category."""
    statement = select(CostCategory).where(CostCategory.id == category_id)
    category = session.exec(statement).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    session.delete(category)
    session.commit()
    return {"ok": True}
