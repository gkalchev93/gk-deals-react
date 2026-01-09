import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, Expense } from '../types';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Plus, Gauge } from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    async function fetchProjectData() {
        try {
            setLoading(true);

            // Fetch Project
            const { data: projectData, error: projectError } = await supabase
                .from('project')
                .select('*')
                .eq('id', id)
                .single();

            if (projectError) throw projectError;
            setProject(projectData);

            // Fetch Expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from('expense')
                .select('*')
                .eq('project_id', id)
                .order('date', { ascending: false });

            if (expensesError) throw expensesError;
            setExpenses(expensesData || []);

        } catch (error) {
            console.error('Error fetching project details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
    }

    if (!project) return null;

    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const buyPrice = project.buy_price || 0;
    const totalSpent = buyPrice + expenseTotal;
    const soldPrice = project.sold_price || 0;
    const profit = soldPrice - totalSpent;
    const isProfitable = profit >= 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project Overview */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                        <div className="h-64 w-full bg-gray-900 relative">
                            {project.image_path ? (
                                <img src={project.image_path} alt={project.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">🖼️</div>
                            )}
                            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                {project.type}
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                                    <p className="text-gray-400 italic mb-4">"{project.description || 'No description provided.'}"</p>
                                    {project.type === 'Car Rebuild' && project.odometer !== undefined && (
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-gray-400 bg-gray-800/50 w-fit px-3 py-1.5 rounded-lg border border-gray-700/50">
                                                <Gauge size={16} className="text-blue-400" />
                                                <span className="text-sm font-bold tracking-wide">
                                                    Start: {new Intl.NumberFormat('en-DE').format(project.odometer)} km
                                                </span>
                                            </div>
                                            {project.status === 'completed' && project.odometer_end && (
                                                <>
                                                    <div className="flex items-center gap-2 text-gray-400 bg-gray-800/50 w-fit px-3 py-1.5 rounded-lg border border-gray-700/50">
                                                        <Gauge size={16} className="text-green-400" />
                                                        <span className="text-sm font-bold tracking-wide">
                                                            End: {new Intl.NumberFormat('en-DE').format(project.odometer_end)} km
                                                        </span>
                                                    </div>
                                                    {project.odometer_end > project.odometer && (
                                                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 w-fit px-3 py-1.5 rounded-lg border border-green-500/20">
                                                            <TrendingUp size={16} />
                                                            <span className="text-sm font-bold tracking-wide">
                                                                Total: {new Intl.NumberFormat('en-DE').format(project.odometer_end - project.odometer)} km driven
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                    {project.status?.toUpperCase() || 'ACTIVE'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expense History */}
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Calendar size={20} className="text-blue-400" />
                                Expense History
                            </h3>
                            {project.status !== 'completed' && (
                                <button
                                    onClick={() => setIsAddExpenseOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                >
                                    <Plus size={16} />
                                    Add Expense
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 italic">No expenses recorded yet.</p>
                            ) : (
                                expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 bg-[#111] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-800 rounded-lg">
                                                <Tag size={16} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{expense.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">
                                                {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                                            </p>
                                            <p className="text-[10px] text-gray-600 uppercase font-bold">{expense.category}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-400" />
                            Financial Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-[#111] rounded-xl border border-gray-800">
                                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Buy Price</span>
                                <span className="text-2xl font-bold text-white">
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(buyPrice)}
                                </span>
                            </div>

                            <div className="p-4 bg-[#111] rounded-xl border border-gray-800">
                                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Total Investment</span>
                                <span className="text-2xl font-bold text-blue-400">
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalSpent)}
                                </span>
                                <p className="text-[10px] mt-1 text-gray-500 uppercase font-bold">Buy Price + Expenses</p>
                            </div>

                            <div className="p-4 bg-[#111] rounded-xl border border-gray-800">
                                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Sold Price</span>
                                <span className="text-2xl font-bold text-green-400">
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(soldPrice)}
                                </span>
                            </div>

                            <div className={`p-6 rounded-xl border ${isProfitable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs uppercase font-bold opacity-60">Estimated Profit</span>
                                    {isProfitable ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                                </div>
                                <span className={`text-3xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(profit)}
                                </span>
                                <p className="text-[10px] mt-2 opacity-50 uppercase font-bold">
                                    {isProfitable ? 'Ready for next deal!' : 'Under budget target'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <DollarSign size={16} className="text-yellow-500" />
                                <span>ROI: {totalSpent > 0 ? ((profit / totalSpent) * 100).toFixed(1) : 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isAddExpenseOpen && (
                <AddExpenseModal
                    isOpen={isAddExpenseOpen}
                    projectId={Number(id)}
                    projectName={project.name}
                    onClose={() => setIsAddExpenseOpen(false)}
                    onAdded={() => {
                        fetchProjectData();
                    }}
                />
            )}
        </div>
    );
}
