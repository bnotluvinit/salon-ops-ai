from typing import Optional, Dict
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

# --- Persistence Models ---

class FixedCosts(SQLModel, table=True):
    """
    Persisted monthly fixed costs configuration.
    Expanded to match the detailed P&L spreadsheet.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Occupancy
    rent: Decimal = Field(default=Decimal("6286.70"), decimal_places=2)
    utilities: Decimal = Field(default=Decimal("800.00"), decimal_places=2)
    telephone: Decimal = Field(default=Decimal("250.00"), decimal_places=2)
    maintenance: Decimal = Field(default=Decimal("300.00"), decimal_places=2)
    
    # G&A
    advertising: Decimal = Field(default=Decimal("1200.00"), decimal_places=2)
    insurance: Decimal = Field(default=Decimal("200.00"), decimal_places=2)
    professional_fees: Decimal = Field(default=Decimal("300.00"), decimal_places=2)
    receptionist_labor: Decimal = Field(default=Decimal("1700.00"), decimal_places=2)
    receptionist_payroll_tax: Decimal = Field(default=Decimal("170.00"), decimal_places=2)
    travel: Decimal = Field(default=Decimal("50.00"), decimal_places=2)
    meals_entertainment: Decimal = Field(default=Decimal("100.00"), decimal_places=2)
    training: Decimal = Field(default=Decimal("50.00"), decimal_places=2)
    taxes_licenses: Decimal = Field(default=Decimal("150.00"), decimal_places=2)
    debt_service: Decimal = Field(default=Decimal("2600.00"), decimal_places=2)
    postage: Decimal = Field(default=Decimal("25.00"), decimal_places=2)
    pos_system: Decimal = Field(default=Decimal("300.00"), decimal_places=2)
    donations_promotional: Decimal = Field(default=Decimal("150.00"), decimal_places=2)
    store_supplies: Decimal = Field(default=Decimal("100.00"), decimal_places=2)
    office_supplies: Decimal = Field(default=Decimal("100.00"), decimal_places=2)
    
    # Legacies / Others
    software: Decimal = Field(default=0, decimal_places=2)
    other: Decimal = Field(default=0, decimal_places=2)
    
    @property
    def total_monthly_fixed_costs(self) -> Decimal:
        return (
            self.rent + self.utilities + self.telephone + self.maintenance +
            self.advertising + self.insurance + self.professional_fees +
            self.receptionist_labor + self.receptionist_payroll_tax +
            self.travel + self.meals_entertainment + self.training +
            self.taxes_licenses + self.debt_service + self.postage +
            self.pos_system + self.donations_promotional +
            self.store_supplies + self.office_supplies +
            self.software + self.other
        )

# --- Request/Response Models (Pure Pydantic) ---

class OperationalInputs(BaseModel):
    """Inputs for the forecasting engine (not persisted)."""
    haircuts_per_day: int
    price_per_cut: Decimal
    stylist_hours_per_day: Decimal
    stylist_hourly_rate: Decimal
    operating_days_per_month: int
    num_stylists: int = 1
    
    # New Revenue Streams
    retail_sales: Decimal = Decimal(0)
    party_sales: Decimal = Decimal(0)
    
    # Advanced Settings (Percentages)
    stylist_payroll_tax_pct: Decimal = Decimal("0.10")
    retail_cogs_pct: Decimal = Decimal("0.50")
    party_cogs_pct: Decimal = Decimal("0.20")
    royalties_pct: Decimal = Decimal("0.05")
    cc_fees_pct: Decimal = Decimal("0.02")
    ad_fund_pct: Decimal = Decimal("0.02")

class RiskFlags(BaseModel):
    negative_cash_flow: bool = False
    labor_too_high: bool = False
    margin_too_low: bool = False

class FinancialSnapshot(BaseModel):
    """Computed outputs from the forecasting engine."""
    # Revenue Breakdown
    service_revenue: Decimal
    retail_revenue: Decimal
    party_revenue: Decimal
    total_revenue: Decimal
    
    # Costs
    stylist_labor_cost: Decimal # Base
    labor_tax_cost: Decimal    # Tax (e.g. 10%)
    total_labor_cost: Decimal  # Base + Tax
    
    retail_cogs: Decimal
    party_cogs: Decimal
    total_cogs: Decimal        # Labor + Retail COGS + Party COGS
    
    # Variable Expenses (based on sales)
    royalties: Decimal
    cc_fees: Decimal
    ad_fund: Decimal
    total_variable_expenses: Decimal
    
    # Fixed Expenses
    total_monthly_fixed_costs: Decimal
    fixed_costs: FixedCosts 
    
    # Totals
    total_monthly_costs: Decimal
    
    # Profits
    gross_profit: Decimal      # Revenue - Total COGS
    net_profit: Decimal        # Gross Profit - Var Expenses - Fixed Costs
    
    # Metrics
    gross_profit_margin: float
    net_profit_margin: float
    labor_pct_of_sales: float
    
    # Risks
    risk_flags: RiskFlags

    model_config = ConfigDict(coerce_numbers_to_str=True)
