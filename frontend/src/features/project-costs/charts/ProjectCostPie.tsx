import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ProjectCostsSummary } from '../../../types';

interface Props {
    summary: ProjectCostsSummary;
}

const COLORS = [
    '#10b981', // Emerald (Actual Spent)
    '#334155', // Slate-700 (Remaining Projected)
    '#f43f5e', // Rose (Over Budget - optional use)
];

export const ProjectCostPie: React.FC<Props> = ({ summary }) => {
    const totalProjected = typeof summary.total_projected === 'string'
        ? parseFloat(summary.total_projected)
        : summary.total_projected;
    const totalActual = typeof summary.total_actual === 'string'
        ? parseFloat(summary.total_actual)
        : summary.total_actual;

    const remaining = Math.max(0, totalProjected - totalActual);
    const overBudget = Math.max(0, totalActual - totalProjected);

    const data = [
        { name: 'Actually Spent', value: totalActual },
        { name: 'Remaining Budget', value: remaining },
    ].filter(d => d.value > 0);

    // If over budget, show a different comparison
    const overBudgetData = [
        { name: 'Projected Budget', value: totalProjected },
        { name: 'Over Budget', value: overBudget },
    ];

    const displayData = overBudget > 0 ? overBudgetData : data;
    const displayColors = overBudget > 0 ? ['#10b981', '#f43f5e'] : COLORS;

    const percentageUsed = totalProjected > 0
        ? ((totalActual / totalProjected) * 100).toFixed(1)
        : '0';

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={displayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {displayData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={displayColors[index % displayColors.length]} stroke="rgba(0,0,0,0)" />
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
                        wrapperStyle={{ color: '#94a3b8', paddingTop: '10px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-slate-100">{percentageUsed}%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Used</div>
            </div>
        </div>
    );
};
