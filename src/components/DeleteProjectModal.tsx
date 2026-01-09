import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleted: () => void;
    project: Project;
}

export default function DeleteProjectModal({ isOpen, onClose, onDeleted, project }: DeleteProjectModalProps) {
    const [confirmationName, setConfirmationName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleDelete() {
        if (confirmationName !== project.name) return;
        setLoading(true);

        try {
            // Soft delete
            const { error } = await supabase
                .from('project')
                .update({ is_deleted: true })
                .eq('id', project.id);

            if (error) throw error;

            onDeleted();
            onClose();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-red-900/50 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-red-500 flex items-center gap-2">
                        <AlertTriangle size={24} />
                        Delete Project
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-300">
                        This action will soft-delete <span className="font-bold text-white">{project.name}</span>.
                        It will no longer appear in your dashboard.
                    </p>

                    <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                        <label className="block text-xs uppercase text-red-400 font-semibold mb-2">
                            To confirm, type "{project.name}" below
                        </label>
                        <input
                            type="text"
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                            placeholder={project.name}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={confirmationName !== project.name || loading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Deleting...' : (
                                <>
                                    <Trash2 size={18} />
                                    I understand, delete this project
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
