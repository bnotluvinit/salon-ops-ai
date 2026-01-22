// Domain Types matching Backend

export interface FixedCosts {
    id?: number;
    rent: string | number; // Handling string input from forms, converted for API
    insurance: string | number;
    utilities: string | number;
    software: string | number;
    debt_service: string | number;
    other: string | number;
}

export interface OperationalInputs {
    haircuts_per_day: number;
    price_per_cut: number;
    stylist_hours_per_day: number;
    stylist_hourly_rate: number;
    operating_days_per_month: number;
    num_stylists: number;
}

export interface RiskFlags {
    negative_cash_flow: boolean;
    labor_too_high: boolean;
    margin_too_low: boolean;
}

export interface FinancialSnapshot {
    daily_revenue: string; // Decimal comes as string from backend usually or number
    monthly_revenue: string;
    daily_labor_cost: string;
    monthly_labor_cost: string;
    total_monthly_fixed_costs: string;
    fixed_costs: FixedCosts;
    total_monthly_costs: string;
    gross_margin: string;
    net_profit: string;
    labor_pct_of_revenue: number;
    net_profit_margin: number;
    risk_flags: RiskFlags;
}
