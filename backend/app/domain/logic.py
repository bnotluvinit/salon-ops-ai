from decimal import Decimal, ROUND_HALF_UP
from app.domain.models import OperationalInputs, FixedCosts, FinancialSnapshot, RiskFlags

def calculate_forecast(inputs: OperationalInputs, costs: FixedCosts) -> FinancialSnapshot:
    """
    Pure domain function to calculate financial snapshot from inputs and costs.
    """
    
    # --- Revenue Calculations ---
    # Daily Revenue = Cuts/Day * Price * Num Stylists? 
    # Or is 'haircuts_per_day' aggregate for the shop? 
    # Assumption: 'haircuts_per_day' is TOTAL for the shop based on the prompt "volume, staffing".
    # However, user prompt said "stylist_hours_per_day".
    # Let's assume 'haircuts_per_day' is TOTAL volume. 
    # Let's assume 'stylist_hours_per_day' is TOTAL hours paid daily across all staff 
    # (or we multiply by num_stylists if the input implies per stylist).
    
    # Clarification from prompt: "stylist_hours_per_day" and "stylist_hourly_rate".
    # I added 'num_stylists' to inputs to be safe, but if inputs are "per day" aggregates, we use them directly.
    # Let's treat inputs as "Shop Totals" for simplicity unless 'num_stylists' > 1 is strictly used.
    # Actually, to make it robust:
    # Daily Labor = inputs.num_stylists * inputs.stylist_hours_per_day * inputs.stylist_hourly_rate
    # Daily Revenue = inputs.haircuts_per_day * inputs.price_per_cut
    
    daily_revenue = inputs.haircuts_per_day * inputs.price_per_cut
    monthly_revenue = daily_revenue * inputs.operating_days_per_month
    
    # Labor Costs
    # Assumption: stylist_hours_per_day is PER STYLIST.
    daily_labor_cost = inputs.num_stylists * inputs.stylist_hours_per_day * inputs.stylist_hourly_rate
    monthly_labor_cost = daily_labor_cost * inputs.operating_days_per_month
    
    # Total Costs
    total_fixed_costs = costs.total_monthly_fixed_costs
    total_monthly_costs = monthly_labor_cost + total_fixed_costs
    
    # Profitability
    gross_margin = monthly_revenue - monthly_labor_cost
    net_profit = monthly_revenue - total_monthly_costs
    
    # Metrics
    if monthly_revenue > 0:
        labor_pct = float(monthly_labor_cost / monthly_revenue)
        net_margin_pct = float(net_profit / monthly_revenue)
    else:
        labor_pct = 0.0
        net_margin_pct = 0.0
        
    # Risks
    risks = RiskFlags(
        negative_cash_flow = net_profit < 0,
        labor_too_high = labor_pct > 0.45, # Benchmark: >45% is risky for salons
        margin_too_low = net_margin_pct < 0.10 # Benchmark: <10% is dangerous
    )
    
    return FinancialSnapshot(
        daily_revenue=_round(daily_revenue),
        monthly_revenue=_round(monthly_revenue),
        daily_labor_cost=_round(daily_labor_cost),
        monthly_labor_cost=_round(monthly_labor_cost),
        total_monthly_fixed_costs=_round(total_fixed_costs),
        total_monthly_costs=_round(total_monthly_costs),
        gross_margin=_round(gross_margin),
        net_profit=_round(net_profit),
        labor_pct_of_revenue=round(labor_pct, 4),
        net_profit_margin=round(net_margin_pct, 4),
        risk_flags=risks
    )

def _round(value: Decimal) -> Decimal:
    """Helper to round currency to 2 decimal places."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
