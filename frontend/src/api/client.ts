import type { FixedCosts, OperationalInputs, FinancialSnapshot } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
    async getCosts(): Promise<FixedCosts> {
        const res = await fetch(`${API_URL}/costs`);
        if (!res.ok) throw new Error('Failed to fetch costs');
        return res.json();
    },

    async updateCosts(costs: FixedCosts): Promise<FixedCosts> {
        const res = await fetch(`${API_URL}/costs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(costs),
        });
        if (!res.ok) throw new Error('Failed to update costs');
        return res.json();
    },

    async getForecast(inputs: OperationalInputs): Promise<FinancialSnapshot> {
        const res = await fetch(`${API_URL}/forecast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputs),
        });
        if (!res.ok) throw new Error('Failed to calculate forecast');
        return res.json();
    }
};
