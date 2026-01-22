// Domain Types matching Backend

export interface FixedCosts {
    id?: number;
    // Occupancy
    rent: string | number;
    utilities: string | number;
    telephone: string | number;
    maintenance: string | number;

    // G&A
    advertising: string | number;
    insurance: string | number;
    professional_fees: string | number;
    receptionist_labor: string | number;
    receptionist_payroll_tax: string | number;
    travel: string | number;
    meals_entertainment: string | number;
    training: string | number;
    taxes_licenses: string | number;
    debt_service: string | number;
    postage: string | number;
    pos_system: string | number;
    donations_promotional: string | number;
    store_supplies: string | number;
    office_supplies: string | number;

    software: string | number;
    other: string | number;
}

export interface OperationalInputs {
    haircuts_per_day: number;
    price_per_cut: number;
    stylist_hours_per_day: number;
    stylist_hourly_rate: number;
    operating_days_per_month: number;
    num_stylists: number;

    // Revenue Streams
    retail_sales: number;
    party_sales: number;

    // Percentages
    stylist_payroll_tax_pct: number;
    retail_cogs_pct: number;
    party_cogs_pct: number;
    royalties_pct: number;
    cc_fees_pct: number;
    ad_fund_pct: number;
}

export interface RiskFlags {
    negative_cash_flow: boolean;
    labor_too_high: boolean;
    margin_too_low: boolean;
}

export interface FinancialSnapshot {
    service_revenue: string;
    retail_revenue: string;
    party_revenue: string;
    total_revenue: string;

    stylist_labor_cost: string;
    labor_tax_cost: string;
    total_labor_cost: string;

    retail_cogs: string;
    party_cogs: string;
    total_cogs: string;

    royalties: string;
    cc_fees: string;
    ad_fund: string;
    total_variable_expenses: string;

    total_monthly_fixed_costs: string;
    fixed_costs: FixedCosts;
    total_monthly_costs: string;

    gross_profit: string;
    net_profit: string;

    gross_profit_margin: number;
    net_profit_margin: number;
    labor_pct_of_sales: number;

    risk_flags: RiskFlags;
}
