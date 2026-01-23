import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfitLossSankey from '../charts/ProfitLossSankey';
import { FinancialSnapshot } from '../../../types';

// Mock Recharts as it's hard to test SVG output in jsdom
vi.mock('recharts', async () => {
    const original = await vi.importActual('recharts');
    return {
        ...original,
        ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
        Sankey: ({ data }: any) => (
            <div data-testid="sankey">
                {data.nodes.map((n: any, i: number) => (
                    <div key={i} data-testid={`node-${n.name}`}>{n.name}</div>
                ))}
                {data.links.map((l: any, i: number) => (
                    <div key={i} data-testid="link">{l.value}</div>
                ))}
            </div>
        ),
    };
});

const mockSnapshot: FinancialSnapshot = {
    service_revenue: "22000",
    retail_revenue: "2000",
    party_revenue: "0",
    total_revenue: "24000",
    stylist_labor_cost: "11000",
    labor_tax_cost: "1100",
    total_labor_cost: "12100",
    retail_cogs: "1000",
    party_cogs: "0",
    total_cogs: "13100",
    total_monthly_fixed_costs: "5000",
    total_variable_expenses: "1000",
    total_monthly_costs: "19100",
    gross_profit: "10900",
    net_profit: "4900", // Profitable
    gross_profit_margin: 0.45,
    net_profit_margin: 0.20,
    labor_pct_of_sales: 0.50,
    fixed_costs: {} as any,
    royalties: "1200",
    cc_fees: "480",
    ad_fund: "480",
    risk_flags: { negative_cash_flow: false, labor_too_high: false, margin_too_low: false }
};

describe('ProfitLossSankey', () => {
    it('renders nodes correctly for a profitable scenario', () => {
        render(<ProfitLossSankey snapshot={mockSnapshot} />);
        expect(screen.getByTestId('node-Revenue')).toBeInTheDocument();
        expect(screen.getByTestId('node-Net Profit')).toBeInTheDocument();
        expect(screen.queryByTestId('node-Shortfall')).not.toBeInTheDocument();
    });

    it('renders shortfall node for a loss scenario', () => {
        const lossSnapshot = { ...mockSnapshot, net_profit: "-2000" };
        render(<ProfitLossSankey snapshot={lossSnapshot} />);
        expect(screen.getByTestId('node-Shortfall')).toBeInTheDocument();
    });

    it('handles string numbers with currency symbols correctly', () => {
        const dirtySnapshot = { ...mockSnapshot, total_revenue: "$24,000.00" };
        render(<ProfitLossSankey snapshot={dirtySnapshot} />);
        // If parsing works, it shouldn't crash and Revenue node should exist
        expect(screen.getByTestId('node-Revenue')).toBeInTheDocument();
    });

    it('shows "No data" message when revenue and costs are zero', () => {
        const emptySnapshot = {
            ...mockSnapshot,
            total_revenue: "0",
            total_labor_cost: "0",
            total_monthly_fixed_costs: "0",
            total_variable_expenses: "0",
            total_cogs: "0",
            net_profit: "0"
        };
        render(<ProfitLossSankey snapshot={emptySnapshot} />);
        expect(screen.getByText(/Calculating chart/i)).toBeInTheDocument();
    });
});
