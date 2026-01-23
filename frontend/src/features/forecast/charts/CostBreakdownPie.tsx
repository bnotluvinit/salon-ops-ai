import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinancialSnapshot } from '../../../types';

interface Props {
    snapshot: FinancialSnapshot;
}

const COLORS = [
    '#6366f1', // Indigo (Labor)
    '#f43f5e', // Rose (Occupancy/Rent)
    '#f59e0b', // Amber (G&A)
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#94a3b8', // Slate
    '#06b6d4', // Cyan
    '#eab308', // Yellow
    '#ef4444', // Red
];

const CostBreakdownPie: React.FC<Props> = ({ snapshot }) => {
    const data = [
        { name: 'Stylist Labor', value: parseFloat(String(snapshot.stylist_labor_cost)) || 0 },
        { name: 'Payroll Tax', value: parseFloat(String(snapshot.labor_tax_cost)) || 0 },
        { name: 'Rent', value: parseFloat(String(snapshot.fixed_costs.rent)) || 0 },
        { name: 'Utilities', value: parseFloat(String(snapshot.fixed_costs.utilities)) || 0 },
        { name: 'Advertising', value: parseFloat(String(snapshot.fixed_costs.advertising)) || 0 },
        { name: 'Royalties', value: parseFloat(String(snapshot.royalties)) || 0 },
        { name: 'CC Fees', value: parseFloat(String(snapshot.cc_fees)) || 0 },
        { name: 'Ad Fund', value: parseFloat(String(snapshot.ad_fund)) || 0 },
        { name: 'Receptionist', value: parseFloat(String(snapshot.fixed_costs.receptionist_labor)) || 0 },
        { name: 'Debt Service', value: parseFloat(String(snapshot.fixed_costs.debt_service)) || 0 },
    ].filter(item => item.value > 0);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ color: '#94a3b8', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CostBreakdownPie;
