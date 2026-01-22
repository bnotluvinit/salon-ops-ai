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
        haircuts_per_day: 15,
        price_per_cut: 45,
        stylist_hours_per_day: 8,
        stylist_hourly_rate: 22,
        operating_days_per_month: 24,
        num_stylists: 2,
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
            <Card title="Operational Assumptions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Haircuts / Day (Total)" name="haircuts_per_day" type="number" min={0} value={inputs.haircuts_per_day} onChange={handleChange} />
                    <Input label="Avg Price / Cut ($)" name="price_per_cut" type="number" min={0} value={inputs.price_per_cut} onChange={handleChange} />
                    <Input label="Days Open / Month" name="operating_days_per_month" type="number" min={0} value={inputs.operating_days_per_month} onChange={handleChange} />
                    <Input label="Number of Stylists" name="num_stylists" type="number" min={0} value={inputs.num_stylists} onChange={handleChange} />
                    <Input label="Stylist Hours / Day" name="stylist_hours_per_day" type="number" min={0} value={inputs.stylist_hours_per_day} onChange={handleChange} />
                    <Input label="Stylist Hourly Rate ($)" name="stylist_hourly_rate" type="number" min={0} value={inputs.stylist_hourly_rate} onChange={handleChange} />
                </div>
                <div className="mt-4">
                    <Button onClick={handleCalculate} disabled={loading} className="w-full md:w-auto">
                        {loading ? 'Calculating...' : 'Run Forecast'}
                    </Button>
                </div>
            </Card>

            {snapshot && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* KPI Cards */}
                    <Card title="Revenue & Costs">
                        <div className="space-y-2">
                            <Row label="Monthly Revenue" value={`$${snapshot.monthly_revenue}`} bold />
                            <Row label="Daily Revenue" value={`$${snapshot.daily_revenue}`} />
                            <hr className="my-2" />
                            <Row label="Labor Cost" value={`$${snapshot.monthly_labor_cost}`} textClass="text-rose-400" />
                            <Row label="Fixed Costs" value={`$${snapshot.total_monthly_fixed_costs}`} textClass="text-rose-400" />
                            <Row label="Total Costs" value={`$${snapshot.total_monthly_costs}`} textClass="text-rose-500" bold />
                        </div>
                    </Card>

                    <Card title="Profitability & Risk">
                        <div className="space-y-2">
                            <Row label="Gross Margin" value={`$${snapshot.gross_margin}`} />
                            <Row label="Net Profit" value={`$${snapshot.net_profit}`} bold textClass={parseFloat(snapshot.net_profit) < 0 ? 'text-rose-500' : 'text-emerald-400'} size="text-xl" />
                            <hr className="my-2" />
                            <Row label="Net Margin %" value={`${(snapshot.net_profit_margin * 100).toFixed(1)}%`} />
                            <Row label="Labor % of Rev" value={`${(snapshot.labor_pct_of_revenue * 100).toFixed(1)}%`} />

                            <div className="mt-4 flex flex-wrap gap-2">
                                {snapshot.risk_flags.negative_cash_flow && <Badge color="red" text="Negative Cash Flow" />}
                                {snapshot.risk_flags.labor_too_high && <Badge color="yellow" text="Labor Cost High (>45%)" />}
                                {snapshot.risk_flags.margin_too_low && <Badge color="orange" text="Low Margin (<10%)" />}
                                {!snapshot.risk_flags.negative_cash_flow && !snapshot.risk_flags.labor_too_high && !snapshot.risk_flags.margin_too_low && (
                                    <Badge color="green" text="Healthy Operation" />
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {snapshot && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <Card title="Monthly Cost Breakdown">
                        <CostBreakdownPie snapshot={snapshot} />
                    </Card>
                    <Card title="Cash Flow (Sankey)">
                        <ProfitLossSankey snapshot={snapshot} />
                    </Card>
                </div>
            )}
        </div>
    );
};

// Helper Components for this view
const Row = ({ label, value, bold = false, textClass = 'text-slate-200', size = 'text-sm' }: any) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-400 text-sm">{label}</span>
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.red}`}>
            {text}
        </span>
    );
}
