import { useState, useEffect } from 'react';
import { X, Save, Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

interface RemindersModalProps {
    isOpen: boolean;
    project: Project;
    onClose: () => void;
    onSaved: () => void;
}

function formatDateForInput(isoDate: string) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}.${m}.${y}`;
}

function parseInputDate(input: string) {
    if (!input) return null;
    // expect dd.mm.yyyy
    const parts = input.split('.');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
    const iso = `${y}-${m}-${d}`;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return null;
    return iso;
}

export default function RemindersModal({
    isOpen,
    project,
    onClose,
    onSaved
}: RemindersModalProps) {
    const [insuranceDate, setInsuranceDate] = useState(project.insurance_date || '');
    const [technicalDate, setTechnicalDate] = useState(project.technical_check_date || '');
    const [vinetkaDate, setVinetkaDate] = useState(project.vinetka_date || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setInsuranceDate(project.insurance_date || '');
        setTechnicalDate(project.technical_check_date || '');
        setVinetkaDate(project.vinetka_date || '');
    }, [project]);

    if (!isOpen) return null;

    async function handleSave() {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('project')
                .update({
                    insurance_date: insuranceDate || null,
                    technical_check_date: technicalDate || null,
                    vinetka_date: vinetkaDate || null
                })
                .eq('id', project.id);

            if (error) throw error;
            onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving reminders:', error);
            alert('Error saving reminders.');
        } finally {
            setLoading(false);
        }
    }

    const getStatus = (dateStr: string) => {
        if (!dateStr) return 'none';
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        oneMonthFromNow.setHours(0, 0, 0, 0);

        if (date <= today) return 'expired'; // Red
        if (date <= oneMonthFromNow) return 'warning'; // Yellow
        return 'ok'; // Green
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'expired') return <AlertCircle size={16} className="text-red-500" />;
        if (status === 'warning') return <AlertTriangle size={16} className="text-yellow-500" />;
        if (status === 'ok') return <CheckCircle2 size={16} className="text-green-500" />;
        return <Clock size={16} className="text-gray-500" />;
    };

    const ReminderInput = ({
        label,
        value,
        onChange
    }: {
        label: string,
        value: string,
        onChange: (val: string) => void
    }) => {
        const [textValue, setTextValue] = useState(formatDateForInput(value));
        const [error, setError] = useState(false);

        // Sync local text when parent value changes (e.g. initially)
        useEffect(() => {
            setTextValue(formatDateForInput(value));
        }, [value]);

        const handleBlur = () => {
            if (!textValue) {
                onChange('');
                setError(false);
                return;
            }

            const iso = parseInputDate(textValue);
            if (iso) {
                onChange(iso);
                setError(false);
            } else {
                setError(true);
                // Optionally don't clear the text so user can fix it
            }
        };

        const status = getStatus(value);

        return (
            <div className={`bg-[#111] p-4 rounded-xl border transition-colors ${error ? 'border-red-500/50' : 'border-gray-800 hover:border-gray-700'}`}>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                    <StatusIcon status={status} />
                </div>
                <input
                    type="text"
                    placeholder="DD.MM.YYYY"
                    value={textValue}
                    onChange={(e) => {
                        setTextValue(e.target.value);
                        setError(false);
                    }}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-900 border rounded-lg p-2 text-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'}`}
                />
                {error && <p className="text-red-500 text-xs mt-2 font-bold">Invalid format (DD.MM.YYYY)</p>}
                {!error && status === 'expired' && <p className="text-red-500 text-xs mt-2 font-bold">Expired / Due Today!</p>}
                {!error && status === 'warning' && <p className="text-yellow-500 text-xs mt-2 font-bold">Due within 1 month</p>}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div
                className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-lg shadow-2xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                            <Clock size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Project Reminders</h3>
                            <p className="text-xs text-gray-500">{project.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <ReminderInput
                        label="Insurance"
                        value={insuranceDate}
                        onChange={setInsuranceDate}
                    />
                    <ReminderInput
                        label="Technical Check"
                        value={technicalDate}
                        onChange={setTechnicalDate}
                    />
                    <ReminderInput
                        label="Vinetka"
                        value={vinetkaDate}
                        onChange={setVinetkaDate}
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
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/40 active:scale-95"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Reminders
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
