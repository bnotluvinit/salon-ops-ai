import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { FixedCosts } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const CostsForm: React.FC = () => {
    const [costs, setCosts] = useState<FixedCosts>({
        rent: 0,
        insurance: 0,
        utilities: 0,
        software: 0,
        debt_service: 0,
        other: 0,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadCosts();
    }, []);

    const loadCosts = async () => {
        try {
            const data = await api.getCosts();
            setCosts(data);
        } catch (error) {
            console.error(error);
            setMessage('Failed to load costs.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (parseFloat(value) < 0) return;
        setCosts(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await api.updateCosts(costs);
            setMessage('Costs saved successfully!');
        } catch (error) {
            console.error(error);
            setMessage('Failed to save costs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Monthly Fixed Costs">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Rent ($)"
                        name="rent"
                        type="number"
                        min={0}
                        value={costs.rent}
                        onChange={handleChange}
                    />
                    <Input
                        label="Insurance ($)"
                        name="insurance"
                        type="number"
                        min={0}
                        value={costs.insurance}
                        onChange={handleChange}
                    />
                    <Input
                        label="Utilities ($)"
                        name="utilities"
                        type="number"
                        min={0}
                        value={costs.utilities}
                        onChange={handleChange}
                    />
                    <Input
                        label="Software ($)"
                        name="software"
                        type="number"
                        min={0}
                        value={costs.software}
                        onChange={handleChange}
                    />
                    <Input
                        label="Debt Service ($)"
                        name="debt_service"
                        type="number"
                        min={0}
                        value={costs.debt_service}
                        onChange={handleChange}
                    />
                    <Input
                        label="Other ($)"
                        name="other"
                        type="number"
                        min={0}
                        value={costs.other}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center justify-between mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                    {message && <span className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</span>}
                </div>
            </form>
        </Card>
    );
};
