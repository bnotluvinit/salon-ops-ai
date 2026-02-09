import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { ProjectCostsSummary, CostCategory, CostItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ProjectCostsPage: React.FC = () => {
    const [summary, setSummary] = useState<ProjectCostsSummary | null>(null);
    const [categories, setCategories] = useState<CostCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [costItems, setCostItems] = useState<CostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            loadCostItems(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryData, categoriesData] = await Promise.all([
                api.getProjectSummary(),
                api.getCategories()
            ]);
            setSummary(summaryData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to load project data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCostItems = async (categoryId: number) => {
        try {
            const items = await api.getCostItems(categoryId);
            setCostItems(items);
        } catch (error) {
            console.error('Failed to load cost items:', error);
        }
    };

    const formatCurrency = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    };

    const getVarianceColor = (variance: number | string) => {
        const num = typeof variance === 'string' ? parseFloat(variance) : variance;
        if (num > 0) return 'text-emerald-400'; // Under budget
        if (num < 0) return 'text-rose-400'; // Over budget
        return 'text-slate-400';
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'planned': return 'bg-slate-700/50 text-slate-300 border-slate-600';
            case 'committed': return 'bg-amber-900/30 text-amber-300 border-amber-800/50';
            case 'paid': return 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50';
            default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
        }
    };

    if (loading && !summary) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Section */}
            {summary && (
                <Card title="Project Summary">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-slate-400">Total Projected</div>
                            <div className="text-2xl font-bold text-slate-100 mt-1">
                                {formatCurrency(summary.total_projected)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Total Actual</div>
                            <div className="text-2xl font-bold text-slate-100 mt-1">
                                {formatCurrency(summary.total_actual)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Remaining Budget</div>
                            <div className={`text-2xl font-bold mt-1 ${getVarianceColor(summary.remaining_budget)}`}>
                                {formatCurrency(summary.remaining_budget)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Variance</div>
                            <div className={`text-2xl font-bold mt-1 ${getVarianceColor(summary.variance)}`}>
                                {formatCurrency(summary.variance)}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Add Category Button */}
            <div className="flex justify-end">
                <Button onClick={() => setShowAddCategory(true)}>
                    + Add Category
                </Button>
            </div>

            {/* Category Breakdown */}
            {summary && summary.categories.length > 0 ? (
                <Card title="Cost Categories">
                    <div className="space-y-3">
                        {summary.categories.map((categorySummary) => (
                            <div
                                key={categorySummary.category.id}
                                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedCategoryId === categorySummary.category.id
                                        ? 'bg-slate-800/50 border-indigo-500/50'
                                        : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/30'
                                    }`}
                                onClick={() => setSelectedCategoryId(categorySummary.category.id!)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-200">
                                            {categorySummary.category.name}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                            <div>
                                                <span className="text-slate-400">Projected: </span>
                                                <span className="text-slate-200 font-medium">
                                                    {formatCurrency(categorySummary.category.projected_total)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Actual: </span>
                                                <span className="text-slate-200 font-medium">
                                                    {formatCurrency(categorySummary.actual_total)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Variance: </span>
                                                <span className={`font-medium ${getVarianceColor(categorySummary.variance)}`}>
                                                    {formatCurrency(categorySummary.variance)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-slate-400">
                                        {selectedCategoryId === categorySummary.category.id ? '▼' : '▶'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <Card title="Cost Categories">
                    <div className="text-center text-slate-400 py-8">
                        No categories yet. Click "Add Category" to get started.
                    </div>
                </Card>
            )}

            {/* Cost Items for Selected Category */}
            {selectedCategoryId && (
                <Card title={`Cost Items - ${categories.find(c => c.id === selectedCategoryId)?.name}`}>
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowAddItem(true)}>
                                + Add Item
                            </Button>
                        </div>

                        {costItems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-400 border-b border-slate-800">
                                            <th className="pb-3">Description</th>
                                            <th className="pb-3">Vendor</th>
                                            <th className="pb-3">Amount</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {costItems.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-800/50">
                                                <td className="py-3 text-slate-200">{item.description}</td>
                                                <td className="py-3 text-slate-300">{item.vendor}</td>
                                                <td className="py-3 text-slate-200 font-medium">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs border ${getStatusBadgeColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-400">{item.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-8">
                                No cost items for this category yet.
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Modals for adding categories and items would go here */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-md w-full">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Add Category - Coming Soon</h3>
                        <Button onClick={() => setShowAddCategory(false)}>Close</Button>
                    </div>
                </div>
            )}

            {showAddItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-md w-full">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Add Cost Item - Coming Soon</h3>
                        <Button onClick={() => setShowAddItem(false)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
