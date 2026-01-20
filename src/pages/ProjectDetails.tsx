import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, Expense } from '../types';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Plus, Hash, Copy, Check, Edit2, Trash2, FileText, Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import ExpensePieChart from '../components/ExpensePieChart';
import ProjectNotesModal from '../components/ProjectNotesModal';
import RemindersModal from '../components/RemindersModal';
import LicensePlate from '../components/LicensePlate';

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isRemindersOpen, setIsRemindersOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [copiedVin, setCopiedVin] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    async function fetchProjectData() {
        try {
            setLoading(true);

            // Fetch Project and Expenses in parallel
            const [projectResponse, expensesResponse] = await Promise.all([
                supabase
                    .from('project')
                    .select('*')
                    .eq('id', id)
                    .single(),
                supabase
                    .from('expense')
                    .select('*')
                    .eq('project_id', id)
                    .order('date', { ascending: false })
            ]);

            if (projectResponse.error) throw projectResponse.error;
            if (expensesResponse.error) throw expensesResponse.error;

            setProject(projectResponse.data);
            setExpenses(expensesResponse.data || []);

        } catch (error) {
            console.error('Error fetching project details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteExpense(expenseId: number) {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            const { error } = await supabase
                .from('expense')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;
            fetchProjectData();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Error deleting expense.');
        }
    }

    // Memoize stats to prevent recalculation on every render (e.g. when typing in modals)
    const { expenseTotal, buyPrice, totalSpent, soldPrice, profit, isProfitable } = useMemo(() => {
        const eTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
        const bPrice = project?.buy_price || 0;
        const tSpent = bPrice + eTotal;
        const sPrice = project?.sold_price || 0;
        const pFit = sPrice - tSpent;

        return {
            expenseTotal: eTotal,
            buyPrice: bPrice,
            totalSpent: tSpent,
            soldPrice: sPrice,
            profit: pFit,
            isProfitable: pFit >= 0
        };
    }, [project, expenses]);

    const getStatus = (dateStr?: string) => {
        if (!dateStr) return 'none';
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        oneMonthFromNow.setHours(0, 0, 0, 0);

        if (date <= today) return 'expired';
        if (date <= oneMonthFromNow) return 'warning';
        return 'ok';
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'expired') return <AlertCircle size={16} className="text-red-500" />;
        if (status === 'warning') return <AlertTriangle size={16} className="text-yellow-500" />;
        if (status === 'ok') return <CheckCircle2 size={16} className="text-green-500" />;
        return <Clock size={16} className="text-gray-500" />;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
    }

    if (!project) return null;

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
                {/* 1. Project Overview */}
                <div className="lg:col-span-2 space-y-8 order-1">
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
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-2xl sm:text-4xl font-bold mb-2">{project.name}</h1>

                                    {project.type === 'Car Rebuild' && (
                                        <div className="flex flex-wrap items-center gap-4 mb-6">
                                            {project.vin && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-3 text-gray-300 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 font-mono shadow-inner overflow-x-auto whitespace-nowrap">
                                                        <Hash size={18} className="text-blue-400" />
                                                        <span className="text-base font-bold tracking-widest">
                                                            {project.vin}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(project.vin || '');
                                                            setCopiedVin(true);
                                                            setTimeout(() => setCopiedVin(false), 2000);
                                                        }}
                                                        className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-blue-400 border border-transparent hover:border-gray-700"
                                                        title="Copy VIN"
                                                    >
                                                        {copiedVin ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                                    </button>
                                                </div>
                                            )}

                                            {project.license_plate && (
                                                <LicensePlate text={project.license_plate} size="lg" />
                                            )}
                                        </div>
                                    )}
                                    {project.type === 'Car Rebuild' && project.odometer !== undefined && (
                                        <div className="flex flex-wrap gap-3">
                                            {project.status === 'completed' && project.odometer_end && (
                                                <>
                                                    {project.odometer_end > project.odometer && (
                                                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 w-fit px-3 py-1.5 rounded-lg border border-green-500/20">
                                                            <TrendingUp size={16} />
                                                            <span className="text-xs sm:text-sm font-bold tracking-wide">
                                                                Total: {new Intl.NumberFormat('en-DE').format(project.odometer_end - project.odometer)} km driven
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm whitespace-nowrap ${project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                    {project.status?.toUpperCase() || 'ACTIVE'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Notes Section */}
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText size={20} className="text-blue-400" />
                                Project Notes
                            </h3>
                            <button
                                onClick={() => setIsNotesOpen(true)}
                                className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-blue-400 border border-transparent hover:border-gray-700 active:scale-90"
                            >
                                <Edit2 size={20} />
                            </button>
                        </div>
                        <div className="bg-[#111] rounded-xl border border-gray-800/50 p-6 min-h-[120px]">
                            {project.notes ? (
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.notes}</p>
                            ) : (
                                <p className="text-gray-600 italic text-sm text-center py-4">No notes added yet. Click edit to add details about this project.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Financial Summary */}
                <div className="lg:col-span-1 space-y-6 order-2">
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

                            <div className="p-4 bg-[#111] rounded-xl border border-gray-800 transition-all hover:border-gray-700">
                                <div className="flex justify-between items-center gap-4">
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Total Expenses</span>
                                        <span className="text-2xl font-bold text-gray-300">
                                            {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(expenseTotal)}
                                        </span>
                                        <p className="text-[10px] mt-1 text-gray-500 uppercase font-bold">Sum of all expenses</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <ExpensePieChart expenses={expenses} />
                                    </div>
                                </div>
                                <div className="block sm:hidden mt-4 pt-4 border-t border-gray-800/50">
                                    <ExpensePieChart expenses={expenses} />
                                </div>
                            </div>

                            <div className="p-4 bg-[#111] rounded-xl border border-gray-800">
                                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Total Investment</span>
                                <span className="text-2xl font-bold text-blue-400">
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalSpent)}
                                </span>
                                <br />
                                <span className="text-2xl font-bold text-blue-400">
                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'BGN' }).format(totalSpent * 1.95583)}
                                </span>
                                <p className="text-[10px] mt-1 text-gray-500 uppercase font-bold">Buy Price + Expenses</p>
                            </div>

                            {project.status === 'completed' && (
                                <>
                                    <div className="p-4 bg-[#111] rounded-xl border border-gray-800">
                                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Sold Price</span>
                                        <span className="text-2xl font-bold text-green-400">
                                            {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(soldPrice)}
                                        </span>
                                    </div>

                                    <div className={`p-6 rounded-xl border ${isProfitable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs uppercase font-bold opacity-60">Final Profit</span>
                                            {isProfitable ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                                        </div>
                                        <span className={`text-3xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                            {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(profit)}
                                        </span>
                                        <p className="text-[10px] mt-2 opacity-50 uppercase font-bold">
                                            {isProfitable ? 'Ready for next deal!' : 'Under budget target'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {project.status === 'completed' && (
                            <div className="mt-8 pt-6 border-t border-gray-800">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <DollarSign size={16} className="text-yellow-500" />
                                    <span>ROI: {totalSpent > 0 ? ((profit / totalSpent) * 100).toFixed(1) : 0}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reminders Section */}
                {project.type === 'Car Rebuild' && (
                    <div className="lg:col-span-2 space-y-6 order-2 lg:order-2 mt-6 lg:mt-0">
                        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Clock size={20} className="text-purple-400" />
                                    Reminders
                                </h3>
                                <button
                                    onClick={() => setIsRemindersOpen(true)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-purple-400 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Insurance', date: project.insurance_date },
                                    { label: 'Technical Check', date: project.technical_check_date },
                                    { label: 'Vinetka', date: project.vinetka_date }
                                ].map((item, i) => {
                                    const status = getStatus(item.date);
                                    return (
                                        <div key={i} className={`p-3 rounded-xl border flex justify-between items-center ${status === 'expired' ? 'bg-red-500/10 border-red-500/30' :
                                            status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                'bg-[#111] border-gray-800'
                                            }`}>
                                            <div>
                                                <span className={`text-xs uppercase font-bold block mb-1 ${status === 'expired' ? 'text-red-400' :
                                                    status === 'warning' ? 'text-yellow-400' :
                                                        'text-gray-500'
                                                    }`}>{item.label}</span>
                                                <span className="text-sm font-bold text-white">
                                                    {item.date ? new Date(item.date).toLocaleDateString() : 'Not Set'}
                                                </span>
                                            </div>
                                            <StatusIcon status={status} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Expense History */}
                <div className="lg:col-span-2 space-y-8 order-3">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-4 sm:p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Calendar size={20} className="text-blue-400" />
                                Expense History
                            </h3>
                            {project.status !== 'completed' && (
                                <button
                                    onClick={() => setIsAddExpenseOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">Add Expense</span>
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 italic">No expenses recorded yet.</p>
                            ) : (
                                expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 bg-[#111] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-800 rounded-lg">
                                                <Tag size={16} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm sm:text-base">{expense.description}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-white text-sm sm:text-base">
                                                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                                                </p>
                                                <p className="text-[10px] text-gray-600 uppercase font-bold">{expense.category}</p>
                                            </div>

                                            {project.status !== 'completed' && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedExpense(expense);
                                                            setIsEditExpenseOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteExpense(expense.id);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
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
            {isEditExpenseOpen && selectedExpense && (
                <EditExpenseModal
                    isOpen={isEditExpenseOpen}
                    expense={selectedExpense}
                    projectName={project.name}
                    onClose={() => {
                        setIsEditExpenseOpen(false);
                        setSelectedExpense(null);
                    }}
                    onUpdated={() => {
                        fetchProjectData();
                    }}
                />
            )}
            {isNotesOpen && (
                <ProjectNotesModal
                    isOpen={isNotesOpen}
                    projectId={Number(id)}
                    projectName={project.name}
                    initialNotes={project.notes || ''}
                    onClose={() => setIsNotesOpen(false)}
                    onSaved={() => {
                        fetchProjectData();
                    }}
                />
            )}
            {isRemindersOpen && (
                <RemindersModal
                    isOpen={isRemindersOpen}
                    project={project}
                    onClose={() => setIsRemindersOpen(false)}
                    onSaved={() => fetchProjectData()}
                />
            )}
        </div>
    );
}
