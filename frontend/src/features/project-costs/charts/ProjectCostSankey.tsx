import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProjectCostsSummary } from '../../../types';

interface Props {
    summary: ProjectCostsSummary;
}

const SankeyNode = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isOut = x > 250;

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
                {payload?.name}
            </text>
        </g>
    );
};

export const ProjectCostSankey: React.FC<Props> = ({ summary }) => {
    const parse = (val: any) => {
        if (typeof val === 'number') return val;
        const s = String(val || '0').replace(/[^0-9.-]/g, '');
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    };


    // Nodes: 
    // 0: Total Budget
    // 1..N: Categories
    // N+1..M: Expenses (we might want to limit this to avoid clutter)

    const nodes = [
        { name: 'Total Budget', fill: '#818cf8' }, // 0
    ];

    const links: any[] = [];
    let nodeIndex = 1;

    summary.categories.forEach(catSummary => {
        const catValue = parse(catSummary.category.projected_total);
        if (catValue <= 0) return;

        const currentCatIndex = nodeIndex++;
        nodes.push({
            name: catSummary.category.name,
            fill: '#6366f1'
        });

        // Link from Total Budget to Category
        links.push({
            source: 0,
            target: currentCatIndex,
            value: catValue
        });
    });

    if (links.length === 0) {
        return <div className="h-40 flex items-center justify-center text-slate-500 italic">No data for Sankey...</div>;
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={{ nodes, links }}
                    node={<SankeyNode />}
                    link={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                    margin={{ top: 20, bottom: 20, left: 10, right: 140 }}
                >
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, 'Projected']}
                    />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
};
