from decimal import Decimal, ROUND_HALF_UP
from app.domain.models import OperationalInputs, FixedCosts, FinancialSnapshot, RiskFlags

def calculate_forecast(inputs: OperationalInputs, costs: FixedCosts) -> FinancialSnapshot:
    """
    Pure domain function to calculate financial snapshot from inputs and costs.
    Aligned with the "Pigtails & Crewcuts" spreadsheet logic.
    """
    
    # --- Revenue Calculations ---
    service_revenue = inputs.haircuts_per_day * inputs.price_per_cut * inputs.operating_days_per_month
    retail_revenue = inputs.retail_sales
    party_revenue = inputs.party_sales
    total_revenue = service_revenue + retail_revenue + party_revenue
    
    # --- Cost of Sales (COGS) ---
    # Labor includes tax as per spreadsheet
    base_labor = inputs.num_stylists * inputs.stylist_hours_per_day * inputs.stylist_hourly_rate * inputs.operating_days_per_month
    labor_tax = base_labor * inputs.stylist_payroll_tax_pct
    total_labor = base_labor + labor_tax
    
    retail_cogs = retail_revenue * inputs.retail_cogs_pct
    party_cogs = party_revenue * inputs.party_cogs_pct
    total_cogs = total_labor + retail_cogs + party_cogs
    
    # --- Gross Profit ---
    gross_profit = total_revenue - total_cogs
    
    # --- Variable Expenses (Calculated from Total Sales) ---
    royalties = total_revenue * inputs.royalties_pct
    cc_fees = total_revenue * inputs.cc_fees_pct
    ad_fund = total_revenue * inputs.ad_fund_pct
    total_var_expenses = royalties + cc_fees + ad_fund
    
    # --- Fixed Expenses ---
    total_fixed_costs = costs.total_monthly_fixed_costs
    
    # --- Net Profit / Cash Flow ---
    net_profit = gross_profit - total_var_expenses - total_fixed_costs
    
    # --- Metrics ---
    if total_revenue > 0:
        gross_margin_pct = float(gross_profit / total_revenue)
        net_margin_pct = float(net_profit / total_revenue)
        labor_pct = float(total_labor / total_revenue)
    else:
        gross_margin_pct = 0.0
        net_margin_pct = 0.0
        labor_pct = 0.0
        
    # Risks
    risks = RiskFlags(
        negative_cash_flow = net_profit < 0,
        labor_too_high = labor_pct > 0.45,
        margin_too_low = net_margin_pct < 0.10
    )
    
    return FinancialSnapshot(
        service_revenue=_round(service_revenue),
        retail_revenue=_round(retail_revenue),
        party_revenue=_round(party_revenue),
        total_revenue=_round(total_revenue),
        
        stylist_labor_cost=_round(base_labor),
        labor_tax_cost=_round(labor_tax),
        total_labor_cost=_round(total_labor),
        
        retail_cogs=_round(retail_cogs),
        party_cogs=_round(party_cogs),
        total_cogs=_round(total_cogs),
        
        royalties=_round(royalties),
        cc_fees=_round(cc_fees),
        ad_fund=_round(ad_fund),
        total_variable_expenses=_round(total_var_expenses),
        
        total_monthly_fixed_costs=_round(total_fixed_costs),
        fixed_costs=costs,
        total_monthly_costs=_round(total_cogs + total_var_expenses + total_fixed_costs),
        
        gross_profit=_round(gross_profit),
        net_profit=_round(net_profit),
        
        gross_profit_margin=round(gross_margin_pct, 4),
        net_profit_margin=round(net_margin_pct, 4),
        labor_pct_of_sales=round(labor_pct, 4),
        
        risk_flags=risks
    )

def _round(value: Decimal) -> Decimal:
    """Helper to round currency to 2 decimal places."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
