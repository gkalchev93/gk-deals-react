
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

export default function Settings() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('project')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Settings</h2>
                    <p className="text-gray-400">Manage your projects and preferences</p>
                </div>
            </header>

            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Projects</h3>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus size={16} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-gray-500">Loading projects...</div>
                ) : projects.map(project => (
                    <div key={project.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                                {project.image_path ? (
                                    <img src={project.image_path} alt={project.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">🖼️</div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{project.name}</h4>
                                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                                    {project.type}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setProjectToEdit(project)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                title="Edit Project"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => setProjectToDelete(project)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete Project"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && projects.length === 0 && (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                        No active projects.
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => {
                    fetchProjects();
                }}
            />

            {projectToEdit && (
                <EditProjectModal
                    isOpen={!!projectToEdit}
                    project={projectToEdit}
                    onClose={() => setProjectToEdit(null)}
                    onUpdated={() => {
                        fetchProjects();
                    }}
                />
            )}

            {projectToDelete && (
                <DeleteProjectModal
                    isOpen={!!projectToDelete}
                    project={projectToDelete}
                    onClose={() => setProjectToDelete(null)}
                    onDeleted={() => {
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
}
