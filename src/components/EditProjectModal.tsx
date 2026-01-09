import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

interface EditProjectModalProps {
    isOpen: boolean;
    project: Project;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditProjectModal({ isOpen, project, onClose, onUpdated }: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
    const [type, setType] = useState(project.type);
    const [description, setDescription] = useState(project.description || '');
    const [status, setStatus] = useState<'active' | 'completed'>(project.status || 'active');
    const [buyPrice, setBuyPrice] = useState(String(project.buy_price || 0));
    const [soldPrice, setSoldPrice] = useState(String(project.sold_price || 0));
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Initial state setup when project changes
    useEffect(() => {
        if (project) {
            setName(project.name);
            setType(project.type);
            setDescription(project.description || '');
            setBuyPrice(String(project.buy_price || 0));
            setSoldPrice(String(project.sold_price || 0));
            setStatus(project.status || 'active');
        }
    }, [project]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let imagePath = project.image_path;

            // Upload Image if selected
            if (image) {
                // Parse old storage path from image_path URL
                if (project.image_path) {
                    try {
                        const urlParts = project.image_path.split('/');
                        const oldFileName = urlParts[urlParts.length - 1];
                        if (oldFileName) {
                            await supabase.storage
                                .from('gk-deals-expenses-images')
                                .remove([oldFileName]);
                        }
                    } catch (e) {
                        console.error('Failed to delete old image:', e);
                    }
                }

                const fileExt = image.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('gk-deals-expenses-images')
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gk-deals-expenses-images')
                    .getPublicUrl(filePath);

                imagePath = publicUrl;
            }

            // Update Project
            const { error: updateError } = await supabase
                .from('project')
                .update({
                    name,
                    type,
                    description,
                    image_path: imagePath,
                    status: status,
                    buy_price: type === 'Car Rebuild' ? (parseFloat(buyPrice) || 0) : 0,
                    sold_price: parseFloat(soldPrice) || 0
                })
                .eq('id', project.id);

            if (updateError) throw updateError;

            onUpdated();
            onClose();

        } catch (error) {
            console.error('Error updating project:', error);
            alert('Error updating project. Check console for details.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h3 className="text-xl font-bold">Edit Project</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. BMW E36 Turbo"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option>Car Rebuild</option>
                            <option>PC Build</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {type === 'Car Rebuild' && (
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Buy Price (€)</label>
                                <input
                                    type="number"
                                    value={buyPrice}
                                    onChange={(e) => setBuyPrice(e.target.value)}
                                    className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none h-10"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'active' | 'completed')}
                                className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Sold Price (€)</label>
                            <input
                                type="number"
                                value={soldPrice}
                                onChange={(e) => setSoldPrice(e.target.value)}
                                className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Cover Image</label>
                        {project.image_path && !image && (
                            <div className="mb-2 w-20 h-20 rounded bg-gray-800 overflow-hidden">
                                <img src={project.image_path} alt="Current" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                            <span className="text-sm text-gray-400">
                                {image ? image.name : "Click to change image"}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
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
