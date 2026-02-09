from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.core.db import get_session
from app.domain.models import CostCategory, CostItem, CostCategorySummary, ProjectCostsSummary
from decimal import Decimal

router = APIRouter()

@router.get("/project-summary", response_model=ProjectCostsSummary)
def get_project_summary(session: Session = Depends(get_session)):
    """
    Get aggregated project costs summary with category breakdowns.
    Calculates totals, variances, and percentages.
    """
    # Get all categories
    categories_stmt = select(CostCategory).order_by(CostCategory.sort_order)
    categories = session.exec(categories_stmt).all()
    
    category_summaries = []
    total_projected = Decimal("0.00")
    total_actual = Decimal("0.00")
    
    for category in categories:
        # Sum all cost items for this category
        items_stmt = select(func.sum(CostItem.amount)).where(
            CostItem.category_id == category.id
        )
        actual_total = session.exec(items_stmt).first() or Decimal("0.00")
        
        # Calculate variance
        variance = category.projected_total - actual_total
        variance_pct = float(variance / category.projected_total) if category.projected_total > 0 else 0.0
        
        category_summaries.append(
            CostCategorySummary(
                category=category,
                actual_total=actual_total,
                variance=variance,
                variance_pct=variance_pct
            )
        )
        
        total_projected += category.projected_total
        total_actual += actual_total
    
    remaining_budget = total_projected - total_actual
    variance = total_projected - total_actual
    
    return ProjectCostsSummary(
        total_projected=total_projected,
        total_actual=total_actual,
        remaining_budget=remaining_budget,
        variance=variance,
        categories=category_summaries
    )
