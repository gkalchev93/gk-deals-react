import { useEffect, useState } from 'react';
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
            setLoading(true);

            // Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('project')
                .select('*')
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;

            // Filter out soft-deleted projects
            // Note: If you have RLS policies filtering this on server, this is redundant but safe.
            const activeProjects = (projectsData || []).filter(p => !p.is_deleted);
            setProjects(activeProjects);

            // Fetch Expenses
            // Use 'select' with join if possible, but flat fetching is easier to manage type-wise initially
            const { data: expensesData, error: expensesError } = await supabase
                .from('expense')
                .select('*');

            if (expensesError) throw expensesError;
            setExpenses(expensesData || []);

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

    // Calculate totals
    const totalProjects = projects.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">My Projects</h2>
                    <p className="text-gray-400">Track your build costs and expenses</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#1a1a1a] flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-gray-500 text-xs block">Active Projects</span>
                        <span className="font-bold text-xl">{totalProjects}</span>
                    </div>
                    <div className="bg-[#1a1a1a] flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-gray-500 text-xs block">Total Expenses</span>
                        <span className="font-bold text-xl text-green-400">
                            {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalExpenses)}
                        </span>
                    </div>
                </div>
            </header>

            <div className="h-px bg-gray-800 w-full mb-8"></div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your data...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No projects found. Go to Settings to create one!
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                expenses={expenses.filter(e => e.project_id === project.id)}
                                onAddExpense={handleAddExpense}
                            />
                        ))}
                    </div>

                    {expenseModalProject && (
                        <AddExpenseModal
                            isOpen={!!expenseModalProject}
                            projectId={expenseModalProject.id}
                            projectName={expenseModalProject.name}
                            onClose={() => setExpenseModalProject(null)}
                            onAdded={() => {
                                fetchData(); // Refresh data to show new totals
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
