import { useMemo } from 'react';

interface ExpensePieChartProps {
    expenses: { category?: string; amount: number }[];
}

export default function ExpensePieChart({ expenses }: ExpensePieChartProps) {
    const data = useMemo(() => {
        const categories: Record<string, number> = {};
        expenses.forEach(e => {
            const cat = e.category || 'Other';
            categories[cat] = (categories[cat] || 0) + e.amount;
        });

        const total = Object.values(categories).reduce((a, b) => a + b, 0);
        if (total === 0) return [];

        const colors = [
            '#3b82f6', // blue-500
            '#10b981', // emerald-500
            '#f59e0b', // amber-500
            '#ef4444', // red-500
            '#8b5cf6', // violet-500
            '#ec4899', // pink-500
        ];

        let currentAngle = 0;
        return Object.entries(categories).map(([name, amount], i) => {
            const angle = (amount / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            // Calculate SVG path for the slice
            const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 40 + 50;
            const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 40 + 50;
            const x2 = Math.cos((currentAngle - 90) * Math.PI / 180) * 40 + 50;
            const y2 = Math.sin((currentAngle - 90) * Math.PI / 180) * 40 + 50;

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return {
                name,
                amount,
                percent: (amount / total * 100).toFixed(0),
                pathData,
                color: colors[i % colors.length]
            };
        });
    }, [expenses]);

    if (data.length === 0) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {data.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.pathData}
                            fill={slice.color}
                            className="hover:opacity-80 transition-opacity cursor-help"
                        >
                            <title>{slice.name}: {slice.percent}%</title>
                        </path>
                    ))}
                    {/* Donut hole */}
                    <circle cx="50" cy="50" r="25" fill="#111" />
                </svg>
            </div>
            <div className="flex flex-col gap-1">
                {data.map((slice, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate max-w-[80px]">
                            {slice.name} <span className="text-gray-400">({slice.percent}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
