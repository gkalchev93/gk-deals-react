import { Plus } from 'lucide-react';
import type { Project, Expense } from '../types';

interface ProjectCardProps {
    project: Project;
    expenses: Expense[];
    onAddExpense: (projectId: number) => void;
}

export default function ProjectCard({ project, expenses, onAddExpense }: ProjectCardProps) {
    // Calculate total spent
    // Note: expenses array should be filtered for this project before passing, or passed as a relation
    const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Format currency (Euro)
    const formattedTotal = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalSpent);

    return (
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-colors group">
            {/* Image Container */}
            <div className="h-48 w-full bg-gray-900 relative overflow-hidden">
                {project.image_path ? (
                    <img
                        src={project.image_path}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">
                        🖼️
                    </div>
                )}

                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-white/10">
                    {project.type}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate" title={project.name}>{project.name}</h3>
                {project.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3 h-8">{project.description}</p>
                )}

                <div className="flex items-end justify-between mt-2">
                    <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wider block">Total Spent</span>
                        <span className="text-xl font-bold text-blue-400">{formattedTotal}</span>
                    </div>

                    <button
                        onClick={() => onAddExpense(project.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                        title="Add Expense"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
