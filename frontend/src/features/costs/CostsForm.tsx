import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { FixedCosts } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const CostsForm: React.FC = () => {
    const [costs, setCosts] = useState<FixedCosts>({
        rent: 6286.70,
        utilities: 800,
        telephone: 250,
        maintenance: 300,
        advertising: 1200,
        insurance: 200,
        professional_fees: 300,
        receptionist_labor: 1700,
        receptionist_payroll_tax: 170,
        travel: 50,
        meals_entertainment: 100,
        training: 50,
        taxes_licenses: 150,
        debt_service: 2600,
        postage: 25,
        pos_system: 300,
        donations_promotional: 150,
        store_supplies: 100,
        office_supplies: 100,
        software: 0,
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
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-800 pb-2">Occupancy Expense</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Rent ($)" name="rent" type="number" value={costs.rent} onChange={handleChange} />
                        <Input label="Utilities ($)" name="utilities" type="number" value={costs.utilities} onChange={handleChange} />
                        <Input label="Telephone ($)" name="telephone" type="number" value={costs.telephone} onChange={handleChange} />
                        <Input label="Maint & Repairs ($)" name="maintenance" type="number" value={costs.maintenance} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-800 pb-2">General & Administrative</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input label="Advertising ($)" name="advertising" type="number" value={costs.advertising} onChange={handleChange} />
                        <Input label="Insurance ($)" name="insurance" type="number" value={costs.insurance} onChange={handleChange} />
                        <Input label="Professional Fees ($)" name="professional_fees" type="number" value={costs.professional_fees} onChange={handleChange} />
                        <Input label="Receptionist Labor ($)" name="receptionist_labor" type="number" value={costs.receptionist_labor} onChange={handleChange} />
                        <Input label="Receptionist Tax ($)" name="receptionist_payroll_tax" type="number" value={costs.receptionist_payroll_tax} onChange={handleChange} />
                        <Input label="Travel ($)" name="travel" type="number" value={costs.travel} onChange={handleChange} />
                        <Input label="Meals & Entert. ($)" name="meals_entertainment" type="number" value={costs.meals_entertainment} onChange={handleChange} />
                        <Input label="Training ($)" name="training" type="number" value={costs.training} onChange={handleChange} />
                        <Input label="Taxes & Licenses ($)" name="taxes_licenses" type="number" value={costs.taxes_licenses} onChange={handleChange} />
                        <Input label="Debt Service ($)" name="debt_service" type="number" value={costs.debt_service} onChange={handleChange} />
                        <Input label="Postage ($)" name="postage" type="number" value={costs.postage} onChange={handleChange} />
                        <Input label="POS / QB ($)" name="pos_system" type="number" value={costs.pos_system} onChange={handleChange} />
                        <Input label="Donations/Prom ($)" name="donations_promotional" type="number" value={costs.donations_promotional} onChange={handleChange} />
                        <Input label="Store Supplies ($)" name="store_supplies" type="number" value={costs.store_supplies} onChange={handleChange} />
                        <Input label="Office Supplies ($)" name="office_supplies" type="number" value={costs.office_supplies} onChange={handleChange} />
                        <Input label="Software ($)" name="software" type="number" value={costs.software} onChange={handleChange} />
                        <Input label="Other ($)" name="other" type="number" value={costs.other} onChange={handleChange} />
                    </div>
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
