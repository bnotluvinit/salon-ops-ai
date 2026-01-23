from decimal import Decimal
from app.domain.models import OperationalInputs, FixedCosts
from app.domain.logic import calculate_forecast

def test_calculate_forecast_basic():
    """
    Test the forecasting logic against the 'Pigtails & Crewcuts' spreadsheet golden values.
    """
    inputs = OperationalInputs(
        operating_days_per_month=30,
        haircuts_per_day=22,
        price_per_cut=Decimal("31.00"),
        num_stylists=1,
        stylist_hours_per_day=17,
        stylist_hourly_rate=Decimal("22.00"),
        retail_sales=Decimal("2000.00"),
        party_sales=Decimal("0.00"),
        stylist_payroll_tax_pct=Decimal("0.10"),
        retail_cogs_pct=Decimal("0.50"),
        party_cogs_pct=Decimal("0.20"),
        royalties_pct=Decimal("0.05"),
        cc_fees_pct=Decimal("0.02"),
        ad_fund_pct=Decimal("0.02")
    )
    
    costs = FixedCosts(
        rent=Decimal("6286.70"),
        utilities=Decimal("800.00"),
        telephone=Decimal("250.00"),
        maintenance=Decimal("300.00"),
        advertising=Decimal("1200.00"),
        insurance=Decimal("200.00"),
        professional_fees=Decimal("300.00"),
        receptionist_labor=Decimal("1700.00"),
        receptionist_payroll_tax=Decimal("170.00"),
        travel=Decimal("50.00"),
        meals_entertainment=Decimal("100.00"),
        training=Decimal("50.00"),
        taxes_licenses=Decimal("150.00"),
        debt_service=Decimal("2600.00"),
        postage=Decimal("25.00"),
        pos_system=Decimal("300.00"),
        donations_promotional=Decimal("150.00"),
        store_supplies=Decimal("100.00"),
        office_supplies=Decimal("100.00")
    )
    
    snapshot = calculate_forecast(inputs, costs)
    
    # Assertions based on verified spreadsheet math
    assert snapshot.total_revenue == Decimal("22460.00")
    assert snapshot.total_cogs == Decimal("13342.00")
    assert snapshot.gross_profit == Decimal("9118.00")
    assert snapshot.net_profit == Decimal("-7735.10")
    
    # Verify variable costs breakdown
    # Royalties: 22460 * 0.05 = 1123.00
    # CC Fees: 22460 * 0.02 = 449.20
    # Ad Fund: 22460 * 0.02 = 449.20
    # Total Var: 1123 + 449.20 + 449.20 = 2021.40
    assert snapshot.total_variable_expenses == Decimal("2021.40")

def test_zero_revenue_case():
    inputs = OperationalInputs(
        operating_days_per_month=30,
        haircuts_per_day=0,
        price_per_cut=Decimal("31.00"),
        stylist_hours_per_day=Decimal("8.00"),
        stylist_hourly_rate=Decimal("20.00"),
        retail_sales=0,
        party_sales=0
    )
    # Create a "clean" FixedCosts with all zeros except rent
    costs = FixedCosts(
        rent=Decimal("1000.00"),
        utilities=0, telephone=0, maintenance=0,
        advertising=0, insurance=0, professional_fees=0,
        receptionist_labor=0, receptionist_payroll_tax=0,
        travel=0, meals_entertainment=0, training=0,
        taxes_licenses=0, debt_service=0, postage=0,
        pos_system=0, donations_promotional=0,
        store_supplies=0, office_supplies=0,
        software=0, other=0
    )
    snapshot = calculate_forecast(inputs, costs)
    
    assert snapshot.total_revenue == 0
    # Net profit should be -(Rent + LaborCost)
    # Labor cost = 8 * 20 * 30 = 4800. Tax = 480. Total labor = 5280.
    # Rent = 1000.
    # Expected profit = -6280.
    assert snapshot.net_profit == Decimal("-6280.00")
