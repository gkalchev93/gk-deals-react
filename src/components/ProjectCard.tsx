import { Plus, BarChart3, FileText } from 'lucide-react';
import type { Project, Expense } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
    expenses: Expense[];
    onAddExpense: (projectId: number) => void;
    onNotesClick: (project: Project) => void;
}

export default function ProjectCard({ project, expenses, onAddExpense, onNotesClick }: ProjectCardProps) {
    const navigate = useNavigate();

    // Calculate total spent (buy price + expenses)
    const totalSpent = (project.buy_price || 0) + expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Format currency (Euro)
    const formattedTotal = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(totalSpent);

    return (
        <div
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all group flex flex-col h-full cursor-pointer animate-fade-in"
        >
            {/* Image Container */}
            <div className="h-48 w-full bg-gray-900 relative overflow-hidden block">
                {project.image_path ? (
                    <img
                        src={project.image_path}
                        alt={project.name}
                        loading="lazy"
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
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-blue-400 transition-colors" title={project.name}>{project.name}</h3>

                <p className="text-gray-400 text-xs line-clamp-2 mb-3 h-8">
                    {project.description || ''}
                </p>

                <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                        {project.status === 'completed' ? (
                            <>
                                <span className="text-green-500 text-[10px] uppercase font-bold tracking-wider block">Net Profit</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-green-400">
                                        {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format((project.sold_price || 0) - totalSpent)}
                                    </span>
                                    <BarChart3 size={14} className="text-green-900/40" />
                                </div>
                                {project.type === 'Car Rebuild' && project.odometer_end && project.odometer && project.odometer_end > project.odometer && (
                                    <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                                        🏁 {project.odometer_end - project.odometer} KM DRIVEN
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block">Total Investment</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-blue-400">{formattedTotal}</span>
                                    <BarChart3 size={14} className="text-gray-600" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onNotesClick(project)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 p-2 rounded-lg transition-colors border border-gray-700/50"
                            title="View/Edit Notes"
                        >
                            <FileText size={18} />
                        </button>

                        <button
                            onClick={() => onAddExpense(project.id)}
                            className={`${project.status === 'completed' ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'} p-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20`}
                            title={project.status === 'completed' ? "Closed Deal" : "Add Expense"}
                            disabled={project.status === 'completed'}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
