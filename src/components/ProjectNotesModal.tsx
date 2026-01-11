import { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProjectNotesModalProps {
    isOpen: boolean;
    projectId: number;
    projectName: string;
    initialNotes: string;
    onClose: () => void;
    onSaved: () => void;
}

export default function ProjectNotesModal({
    isOpen,
    projectId,
    projectName,
    initialNotes,
    onClose,
    onSaved
}: ProjectNotesModalProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNotes(initialNotes || '');
    }, [initialNotes]);

    if (!isOpen) return null;

    async function handleSave() {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('project')
                .update({ notes: notes })
                .eq('id', projectId);

            if (error) throw error;
            onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Error saving notes.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div
                className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-lg shadow-2xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <FileText size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Project Notes</h3>
                            <p className="text-xs text-gray-500">{projectName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-[#111] border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none min-h-[250px] resize-none text-sm leading-relaxed"
                        placeholder="Type any important details, parts needed, or reminders here..."
                        autoFocus
                    />
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Notes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
