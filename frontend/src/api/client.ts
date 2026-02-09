import type {
    FixedCosts,
    OperationalInputs,
    FinancialSnapshot,
    CostCategory,
    CostItem,
    ProjectCostsSummary
} from '../types';

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
    },

    // Project Cost Tracking APIs
    async getCategories(): Promise<CostCategory[]> {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    async createCategory(category: CostCategory): Promise<CostCategory> {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    },

    async updateCategory(id: number, category: CostCategory): Promise<CostCategory> {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },

    async deleteCategory(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete category');
    },

    async getCostItems(categoryId?: number): Promise<CostItem[]> {
        const url = categoryId
            ? `${API_URL}/cost-items?category_id=${categoryId}`
            : `${API_URL}/cost-items`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch cost items');
        return res.json();
    },

    async createCostItem(item: CostItem): Promise<CostItem> {
        const res = await fetch(`${API_URL}/cost-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create cost item');
        return res.json();
    },

    async updateCostItem(id: number, item: CostItem): Promise<CostItem> {
        const res = await fetch(`${API_URL}/cost-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to update cost item');
        return res.json();
    },

    async deleteCostItem(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/cost-items/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete cost item');
    },

    async getProjectSummary(): Promise<ProjectCostsSummary> {
        const res = await fetch(`${API_URL}/project-summary`);
        if (!res.ok) throw new Error('Failed to fetch project summary');
        return res.json();
    }
};
