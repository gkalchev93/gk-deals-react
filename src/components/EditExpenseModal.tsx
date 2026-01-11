import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Expense } from '../types';

interface EditExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
    expense: Expense;
    projectName?: string;
}

export default function EditExpenseModal({ isOpen, onClose, onUpdated, expense, projectName }: EditExpenseModalProps) {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(String(expense.amount));
    const [date, setDate] = useState(new Date(expense.date).toISOString().split('T')[0]);
    const [category, setCategory] = useState(expense.category || 'Service');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setAmount(String(expense.amount));
            const expenseDate = new Date(expense.date);
            // Ensure local date string for the input
            const localDate = expenseDate.toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
            setDate(localDate);
            setCategory(expense.category || 'Service');
        }
    }, [expense]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('expense')
                .update({
                    description,
                    amount: parseFloat(amount),
                    category,
                    date: new Date(date).toISOString()
                })
                .eq('id', expense.id);

            if (error) throw error;

            onUpdated();
            onClose();

        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Error updating expense.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div>
                        <h3 className="text-xl font-bold">Edit Expense</h3>
                        {projectName && <span className="text-xs text-blue-400">{projectName}</span>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Cost (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-lg focus:border-blue-500 focus:outline-none"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Description</label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Brake Pads"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option>Service</option>
                                <option>Repair</option>
                                <option>Buying</option>
                                <option>Tuning</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none pl-9"
                                />
                                <Calendar className="absolute left-2.5 top-2.5 text-gray-500" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !amount || !description}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
