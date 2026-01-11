import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, Expense } from '../types';
import ProjectCard from '../components/ProjectCard';
import AddExpenseModal from '../components/AddExpenseModal';

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [expenseModalProject, setExpenseModalProject] = useState<{ id: number, name: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // Keep loading only for the initial fetch to avoid UI flicker
            if (projects.length === 0) setLoading(true);

            // Fetch Projects and Expenses in parallel
            const [projectsResponse, expensesResponse] = await Promise.all([
                supabase
                    .from('project')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('expense')
                    .select('*')
            ]);

            if (projectsResponse.error) throw projectsResponse.error;
            if (expensesResponse.error) throw expensesResponse.error;

            // Filter out soft-deleted projects
            const activeProjectsData = (projectsResponse.data || []).filter(p => !p.is_deleted);
            setProjects(activeProjectsData);
            setExpenses(expensesResponse.data || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddExpense = (projectId: number) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setExpenseModalProject({ id: projectId, name: project.name });
        }
    };

    // Memoize the sorted projects and filtered lists
    const { activeProjects, completedProjects, totalPortfolioValue } = useMemo(() => {
        // Pre-calculate latest activity for each project for O(E + P log P) instead of O(P * E)
        const projectActivityMap = new Map<number, number>();

        // Initialize with creation date
        projects.forEach(p => {
            projectActivityMap.set(p.id, new Date(p.created_at).getTime());
        });

        // Update with expense dates
        expenses.forEach(e => {
            const currentLatest = projectActivityMap.get(e.project_id) || 0;
            const expenseTime = new Date(e.date).getTime();
            if (expenseTime > currentLatest) {
                projectActivityMap.set(e.project_id, expenseTime);
            }
        });

        const sorted = [...projects].sort((a, b) => {
            const timeA = projectActivityMap.get(a.id) || 0;
            const timeB = projectActivityMap.get(b.id) || 0;
            return timeB - timeA;
        });

        const active = sorted.filter(p => p.status !== 'completed');
        const completed = sorted.filter(p => p.status === 'completed');

        // Total Portfolio = Sum of all Buy Prices + Sum of all Expenses
        const totalBuyPrice = projects.reduce((sum, p) => sum + (p.buy_price || 0), 0);
        const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalValue = totalBuyPrice + totalExpenseAmount;

        return {
            activeProjects: active,
            completedProjects: completed,
            totalPortfolioValue: totalValue
        };
    }, [projects, expenses]);

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">My Projects</h2>
                    <p className="text-gray-400">Track your build costs and expenses</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#1a1a1a] flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-gray-500 text-xs block">Live Deals</span>
                        <span className="font-bold text-xl text-blue-400">{activeProjects.length}</span>
                    </div>
                    <div className="bg-[#1a1a1a] flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-gray-500 text-xs block">Total Investment</span>
                        <span className="font-bold text-xl text-green-400">
                            {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalPortfolioValue)}
                        </span>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your data...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No projects found. Go to Settings to create one!
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Active Projects Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">Active</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                            {activeProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    expenses={expenses.filter(e => e.project_id === project.id)}
                                    onAddExpense={handleAddExpense}
                                />
                            ))}
                            {activeProjects.length === 0 && (
                                <div className="col-span-full py-10 text-center border border-dashed border-gray-800 rounded-xl text-gray-600">
                                    All deals are currently closed.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Completed Projects Section */}
                    {completedProjects.length > 0 && (
                        <section className="pt-8 border-t border-gray-800/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">Completed & Sold</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all animate-fade-in">
                                {completedProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        expenses={expenses.filter(e => e.project_id === project.id)}
                                        onAddExpense={handleAddExpense}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {expenseModalProject && (
                        <AddExpenseModal
                            isOpen={!!expenseModalProject}
                            projectId={expenseModalProject.id}
                            projectName={expenseModalProject.name}
                            onClose={() => setExpenseModalProject(null)}
                            onAdded={() => {
                                fetchData();
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
