import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('Car Rebuild');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'completed'>('active');
    const [soldPrice, setSoldPrice] = useState('0');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let imagePath = null;

            // Upload Image if selected
            if (image) {
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

            // Get User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('You must be logged in to create a project');

            // Create Project
            const { error: insertError } = await supabase
                .from('project')
                .insert([
                    {
                        name,
                        type,
                        description,
                        image_path: imagePath,
                        is_deleted: false,
                        user_id: user.id,
                        status: status,
                        sold_price: parseFloat(soldPrice) || 0
                    }
                ]);

            if (insertError) throw insertError;

            onCreated();
            onClose();
            // Reset form
            setName('');
            setDescription('');
            setImage(null);

        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project. Check console for details.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h3 className="text-xl font-bold">New Project</h3>
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
                            <option>Home Renovation</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none h-24"
                            placeholder="Project goals..."
                        />
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
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                            <span className="text-sm text-gray-400">
                                {image ? image.name : "Click to upload image"}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
