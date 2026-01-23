import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import type { FinancialSnapshot } from '../../../types';

interface Props {
    snapshot: FinancialSnapshot;
}

const SankeyNode = (props: any) => {
    const { x, y, width, height, payload, value } = props;
    const isOut = x > 250;

    // Multi-fallback value detection
    const val = value ?? payload?.value ?? payload?.payload?.value ?? 0;
    const displayValue = Math.round(val).toLocaleString();

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload?.fill || '#6366f1'}
                stroke="#334155"
                strokeWidth={1}
            />
            <text
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2}
                dy=".35em"
                textAnchor={isOut ? 'end' : 'start'}
                fontSize="10"
                fill="#cbd5e1"
                fontWeight="500"
            >
                {`${payload?.name || ''}: $${displayValue}`}
            </text>
        </g>
    );
};

const ProfitLossSankey: React.FC<Props> = ({ snapshot }) => {
    // Hardened parsing to handle strings with $, commas, etc.
    const parse = (val: any) => {
        if (typeof val === 'number') return val;
        const s = String(val || '0').replace(/[^0-9.-]/g, '');
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    };

    const revenue = parse(snapshot.total_revenue);
    const labor = parse(snapshot.total_labor_cost); // Use total labor (base + tax)
    const fixed = parse(snapshot.total_monthly_fixed_costs);
    const variable = parse(snapshot.total_variable_expenses);
    const retailCogs = parse(snapshot.retail_cogs);
    const partyCogs = parse(snapshot.party_cogs);
    const netProfit = parse(snapshot.net_profit);

    const isProfitable = netProfit > 0;
    const shortfall = !isProfitable ? Math.abs(netProfit) : 0;
    const totalCogs = retailCogs + partyCogs;

    // Simple 2-layer flow: [Revenue, Shortfall] -> [Labor, Fixed, Var, Retail/Party COGS, Profit]
    // To make it balance: 
    // Source: Revenue + Shortfall
    // Targets: Labor + Fixed + Variable + COGS + (if profit) NetProfit
    const nodes = [
        { name: 'Revenue', fill: '#818cf8' },      // 0
        { name: 'Shortfall', fill: '#ef4444' },    // 1
        { name: 'Labor', fill: '#6366f1' },        // 2
        { name: 'Fixed Costs', fill: '#fb7185' },  // 3
        { name: 'Variable Exp', fill: '#ec4899' }, // 4
        { name: 'Retail COGS', fill: '#f59e0b' },  // 5
        { name: 'Net Profit', fill: '#10b981' },   // 6
    ];

    const links: any[] = [];

    // Root sources are Revenue and Shortfall. 
    // We distribute from Revenue/Shortfall to the outputs.
    // For a 2-layer Sankey to work well, we can just map everything to Revenue.
    // If there's a shortfall, it's an additional "source".

    const source0 = revenue > 0 ? 0 : -1;
    const source1 = shortfall > 0 ? 1 : -1;

    // Distribute proportions
    const totalOut = labor + fixed + variable + totalCogs + (isProfitable ? netProfit : 0);

    const addDistLink = (target: number, value: number) => {
        if (value <= 0) return;
        if (source0 !== -1) {
            // Recharts is happier if we just map sources to targets directly.
            links.push({ source: 0, target, value: value * (revenue / (revenue + shortfall)) });
            if (source1 !== -1) {
                links.push({ source: 1, target, value: value * (shortfall / (revenue + shortfall)) });
            }
        } else if (source1 !== -1) {
            links.push({ source: 1, target, value });
        }
    };

    addDistLink(2, labor);
    addDistLink(3, fixed);
    addDistLink(4, variable);
    addDistLink(5, totalCogs);
    if (isProfitable) addDistLink(6, netProfit);

    // Final filter: only nodes used in links
    const activeIndices = new Set();
    const finalLinks = links.filter(l => l.value > 0.01);
    finalLinks.forEach(l => { activeIndices.add(l.source); activeIndices.add(l.target); });

    const finalNodes = nodes.map((n, i) => activeIndices.has(i) ? n : null);
    const indexMap = new Map();
    const filteredNodes: any[] = [];
    finalNodes.forEach((n, i) => {
        if (n) {
            indexMap.set(i, filteredNodes.length);
            filteredNodes.push(n);
        }
    });

    const mappedLinks = finalLinks.map(l => ({
        source: indexMap.get(l.source),
        target: indexMap.get(l.target),
        value: l.value
    }));

    if (mappedLinks.length === 0) return <div className="h-40 flex items-center justify-center text-slate-500 italic">Calculating chart...</div>;

    return (
        <div className="h-80 w-full overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={{ nodes: filteredNodes, links: mappedLinks }}
                    node={<SankeyNode />}
                    link={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                    margin={{ top: 20, bottom: 20, left: 10, right: 140 }}
                >
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, 'Amount']}
                    />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
};

export default ProfitLossSankey;
