import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { ProjectCostsSummary, CostCategory, CostItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProjectCostPie } from './charts/ProjectCostPie';
import { ProjectCostSankey } from './charts/ProjectCostSankey';

export const ProjectCostsPage: React.FC = () => {
    const [summary, setSummary] = useState<ProjectCostsSummary | null>(null);
    const [categories, setCategories] = useState<CostCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [costItems, setCostItems] = useState<CostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CostCategory | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', projected_total: '' });
    const [newItem, setNewItem] = useState({
        description: '',
        vendor: '',
        amount: '',
        status: 'planned' as const,
        date: new Date().toISOString().split('T')[0]
    });

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

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createCategory({
                name: newCategory.name,
                projected_total: parseFloat(newCategory.projected_total) || 0,
                sort_order: categories.length + 1
            });
            setNewCategory({ name: '', projected_total: '' });
            setShowAddCategory(false);
            loadData();
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || editingCategory.id === undefined) return;

        try {
            const projectedTotal = typeof editingCategory.projected_total === 'string'
                ? parseFloat(editingCategory.projected_total)
                : editingCategory.projected_total;

            await api.updateCategory(editingCategory.id, {
                ...editingCategory,
                projected_total: isNaN(projectedTotal) ? 0 : projectedTotal
            });

            setShowEditCategory(false);
            setEditingCategory(null);
            await loadData();
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to save category. Please try again.');
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId) return;
        try {
            await api.createCostItem({
                category_id: selectedCategoryId,
                description: newItem.description,
                vendor: newItem.vendor,
                amount: parseFloat(newItem.amount) || 0,
                status: newItem.status,
                date: newItem.date
            });
            setNewItem({
                description: '',
                vendor: '',
                amount: '',
                status: 'planned',
                date: new Date().toISOString().split('T')[0]
            });
            setShowAddItem(false);
            loadData();
            loadCostItems(selectedCategoryId);
        } catch (error) {
            console.error('Failed to create cost item:', error);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Delete this category? This will also delete all items within it.')) return;
        try {
            await api.deleteCategory(id);
            if (selectedCategoryId === id) setSelectedCategoryId(null);
            loadData();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const handleDeleteCostItem = async (id: number) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.deleteCostItem(id);
            if (selectedCategoryId) loadCostItems(selectedCategoryId);
            loadData();
        } catch (error) {
            console.error('Failed to delete cost item:', error);
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

            {/* Visualization Section */}
            {summary && summary.categories.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Budget Usage (%)">
                        <ProjectCostPie summary={summary} />
                    </Card>
                    <Card title="Project Cost Flow">
                        <ProjectCostSankey summary={summary} />
                    </Card>
                </div>
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
                                        <div className="flex items-center justify-between pr-4">
                                            <h3 className="text-lg font-semibold text-slate-200">
                                                {categorySummary.category.name}
                                            </h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingCategory(categorySummary.category);
                                                        setShowEditCategory(true);
                                                    }}
                                                    className="text-slate-500 hover:text-indigo-400 transition-colors text-xs"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(categorySummary.category.id!);
                                                    }}
                                                    className="text-slate-500 hover:text-rose-400 transition-colors text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
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
                                    <div className="text-slate-400 ml-4">
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
                                            <th className="pb-3 px-2">Description</th>
                                            <th className="pb-3 px-2">Vendor</th>
                                            <th className="pb-3 px-2">Amount</th>
                                            <th className="pb-3 px-2">Status</th>
                                            <th className="pb-3 px-2">Date</th>
                                            <th className="pb-3 px-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {costItems.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                                <td className="py-3 px-2 text-slate-200">{item.description}</td>
                                                <td className="py-3 px-2 text-slate-300">{item.vendor}</td>
                                                <td className="py-3 px-2 text-slate-200 font-medium">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs border ${getStatusBadgeColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-slate-400">{item.date}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <button
                                                        onClick={() => handleDeleteCostItem(item.id!)}
                                                        className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
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

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <Card title="Add Cost Category" className="max-w-md w-full shadow-2xl border-slate-700">
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                    placeholder="e.g. Leasehold Improvements"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Projected Budget ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                    placeholder="0.00"
                                    value={newCategory.projected_total}
                                    onChange={(e) => setNewCategory({ ...newCategory, projected_total: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddCategory(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Category
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Add Cost Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <Card title="Add Cost Item" className="max-w-lg w-full shadow-2xl border-slate-700">
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                        placeholder="e.g. Salon Chairs (x6)"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Vendor</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                        placeholder="e.g. Salon Supply Co."
                                        value={newItem.vendor}
                                        onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                        placeholder="0.00"
                                        value={newItem.amount}
                                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                        value={newItem.status}
                                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="committed">Committed</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all [color-scheme:dark] font-inter"
                                        value={newItem.date}
                                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddItem(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Cost Item
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {/* Edit Category Modal */}
            {showEditCategory && editingCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <Card title="Edit Cost Category" className="max-w-md w-full shadow-2xl border-slate-700">
                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Projected Budget ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-inter"
                                    value={editingCategory.projected_total}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, projected_total: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowEditCategory(false);
                                        setEditingCategory(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
