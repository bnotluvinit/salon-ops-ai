from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

# --- Persistence Models ---

class FixedCosts(SQLModel, table=True):
    """
    Persisted monthly fixed costs configuration.
    Only one active record is expected in the simplest version, 
    but we include an ID for standard practice.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    rent: Decimal = Field(default=0, decimal_places=2)
    insurance: Decimal = Field(default=0, decimal_places=2)
    utilities: Decimal = Field(default=0, decimal_places=2)
    software: Decimal = Field(default=0, decimal_places=2)
    debt_service: Decimal = Field(default=0, decimal_places=2)
    other: Decimal = Field(default=0, decimal_places=2)
    
    @property
    def total_monthly_fixed_costs(self) -> Decimal:
        return (
            self.rent + 
            self.insurance + 
            self.utilities + 
            self.software + 
            self.debt_service + 
            self.other
        )

# --- Request/Response Models (Pure Pydantic) ---

class OperationalInputs(BaseModel):
    """Inputs for the forecasting engine (not persisted)."""
    haircuts_per_day: int
    price_per_cut: Decimal
    stylist_hours_per_day: Decimal
    stylist_hourly_rate: Decimal
    operating_days_per_month: int
    num_stylists: int = 1  # Default to 1 if simpler model, but usually >1

class RiskFlags(BaseModel):
    negative_cash_flow: bool = False
    labor_too_high: bool = False
    margin_too_low: bool = False

class FinancialSnapshot(BaseModel):
    """Computed outputs from the forecasting engine."""
    # Revenue
    daily_revenue: Decimal
    monthly_revenue: Decimal
    
    # Costs
    daily_labor_cost: Decimal
    monthly_labor_cost: Decimal
    total_monthly_fixed_costs: Decimal
    fixed_costs: FixedCosts # Individual items for pie chart
    total_monthly_costs: Decimal
    
    # Profits
    gross_margin: Decimal  # (Revenue - COGS/Labor)
    net_profit: Decimal    # (Gross Margin - Fixed Costs)
    
    # Metrics
    labor_pct_of_revenue: float
    net_profit_margin: float
    
    # Risks
    risk_flags: RiskFlags

    model_config = ConfigDict(coerce_numbers_to_str=True) 
    # Helps with Decimal serialization in FastAPI
