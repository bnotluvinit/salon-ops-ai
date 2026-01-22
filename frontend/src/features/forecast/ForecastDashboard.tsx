import React, { useState } from 'react';
import { api } from '../../api/client';
import type { OperationalInputs, FinancialSnapshot } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import CostBreakdownPie from './charts/CostBreakdownPie';
import ProfitLossSankey from './charts/ProfitLossSankey';

export const ForecastDashboard: React.FC = () => {
    const [inputs, setInputs] = useState<OperationalInputs>({
        operating_days_per_month: 30,
        haircuts_per_day: 22,
        price_per_cut: 31,
        num_stylists: 1, // Spreadsheet seems to imply 17 total stylist hours / day
        stylist_hours_per_day: 17,
        stylist_hourly_rate: 22,
        retail_sales: 2000,
        party_sales: 0,
        stylist_payroll_tax_pct: 0.10,
        retail_cogs_pct: 0.50,
        party_cogs_pct: 0.20,
        royalties_pct: 0.05,
        cc_fees_pct: 0.02,
        ad_fund_pct: 0.02,
    });

    const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (parseFloat(value) < 0) return;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const result = await api.getForecast(inputs);
            setSnapshot(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Forecast Assumptions">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Operations & Services</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Days Open / mo" name="operating_days_per_month" type="number" value={inputs.operating_days_per_month} onChange={handleChange} />
                            <Input label="Avg Haircuts / day" name="haircuts_per_day" type="number" value={inputs.haircuts_per_day} onChange={handleChange} />
                            <Input label="Price / Cut ($)" name="price_per_cut" type="number" value={inputs.price_per_cut} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Labor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Stylist Hours / day" name="stylist_hours_per_day" type="number" value={inputs.stylist_hours_per_day} onChange={handleChange} />
                            <Input label="Hourly Rate ($)" name="stylist_hourly_rate" type="number" value={inputs.stylist_hourly_rate} onChange={handleChange} />
                            <Input label="Payroll Tax (%)" name="stylist_payroll_tax_pct" type="number" step="0.01" value={inputs.stylist_payroll_tax_pct} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Other Revenue & Variable Costs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input label="Retail Sales ($)" name="retail_sales" type="number" value={inputs.retail_sales} onChange={handleChange} />
                            <Input label="Party Sales ($)" name="party_sales" type="number" value={inputs.party_sales} onChange={handleChange} />
                            <Input label="Royalties (%)" name="royalties_pct" type="number" step="0.01" value={inputs.royalties_pct} onChange={handleChange} />
                            <Input label="CC Fees (%)" name="cc_fees_pct" type="number" step="0.01" value={inputs.cc_fees_pct} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <Button onClick={handleCalculate} disabled={loading} className="w-full md:w-auto px-12">
                            {loading ? 'Calculating...' : 'Run Forecast'}
                        </Button>
                    </div>
                </div>
            </Card>

            {snapshot && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="Sales Breakdown">
                        <div className="space-y-2">
                            <Row label="Haircuts Sales" value={`$${snapshot.service_revenue}`} />
                            <Row label="Retail Sales" value={`$${snapshot.retail_revenue}`} />
                            <Row label="Party Sales" value={`$${snapshot.party_revenue}`} />
                            <hr className="my-2 border-slate-800" />
                            <Row label="Total Sales" value={`$${snapshot.total_revenue}`} bold textClass="text-slate-100" size="text-lg" />
                        </div>
                    </Card>

                    <Card title="Cost of Sales">
                        <div className="space-y-2">
                            <Row label="Labor (Base)" value={`$${snapshot.stylist_labor_cost}`} />
                            <Row label="Payroll Tax" value={`$${snapshot.labor_tax_cost}`} />
                            <Row label="Retail COGS" value={`$${snapshot.retail_cogs}`} />
                            <Row label="Party COGS" value={`$${snapshot.party_cogs}`} />
                            <hr className="my-2 border-slate-800" />
                            <Row label="Total COGS" value={`$${snapshot.total_cogs}`} bold textClass="text-rose-400" />
                            <Row label="Gross Margin %" value={`${(snapshot.gross_profit_margin * 100).toFixed(1)}%`} />
                        </div>
                    </Card>

                    <Card title="Cash Flow">
                        <div className="space-y-2">
                            <Row label="Gross Profit" value={`$${snapshot.gross_profit}`} bold />
                            <Row label="Variable Expenses" value={`$${snapshot.total_variable_expenses}`} textClass="text-rose-400" />
                            <Row label="Fixed Expenses" value={`$${snapshot.total_monthly_fixed_costs}`} textClass="text-rose-400" />
                            <hr className="my-2 border-slate-800" />
                            <Row
                                label="Cash Flow"
                                value={`$${snapshot.net_profit}`}
                                bold
                                textClass={parseFloat(snapshot.net_profit) < 0 ? 'text-rose-500' : 'text-emerald-400'}
                                size="text-2xl"
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {snapshot.risk_flags.negative_cash_flow && <Badge color="red" text="Negative Cash Flow" />}
                                {snapshot.risk_flags.labor_too_high && <Badge color="yellow" text="Labor Cost High" />}
                                {!snapshot.risk_flags.negative_cash_flow && <Badge color="green" text="Health Snapshot" />}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {snapshot && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <Card title="Expense Composition">
                        <CostBreakdownPie snapshot={snapshot} />
                    </Card>
                    <Card title="Cash Flow Visualization">
                        <ProfitLossSankey snapshot={snapshot} />
                    </Card>
                </div>
            )}
        </div>
    );
};

const Row = ({ label, value, bold = false, textClass = 'text-slate-200', size = 'text-sm' }: any) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className={`${bold ? 'font-bold' : 'font-medium'} ${textClass} ${size}`}>{value}</span>
    </div>
);

const Badge = ({ color, text }: { color: string, text: string }) => {
    const colors: any = {
        red: 'bg-rose-900/30 text-rose-300 border-rose-800/50',
        yellow: 'bg-amber-900/30 text-amber-300 border-amber-800/50',
        orange: 'bg-orange-900/30 text-orange-300 border-orange-800/50',
        green: 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50',
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[color] || colors.red}`}>
            {text}
        </span>
    );
}
