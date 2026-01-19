

interface LicensePlateProps {
    text: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LicensePlate({ text, className = '', size = 'md' }: LicensePlateProps) {
    if (!text) return null;

    const sizes = {
        sm: { height: 'h-6', text: 'text-xs', width: 'w-6', stars: 8 },
        md: { height: 'h-8', text: 'text-base', width: 'w-8', stars: 12 },
        lg: { height: 'h-12', text: 'text-2xl', width: 'w-10', stars: 16 }
    };

    const s = sizes[size];

    return (
        <div className={`inline-flex items-center bg-white border-2 border-black rounded-[4px] shadow-md select-none overflow-hidden ${s.height} ${className}`}>
            {/* Blue Strip */}
            <div className={`bg-[#003399] h-full ${s.width} flex flex-col items-center justify-between py-1`}>
                {/* EU Stars SVG */}
                <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-yellow-400 fill-current">
                        <path d="M12 2l1.2 3.5h3.6l-2.9 2.1 1.1 3.4-2.9-2.2-3 2.2 1.2-3.4-3-2.1h3.7z" transform="translate(0 -2) scale(0.3)" />
                        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" />
                    </svg>
                </div>
                <span className="text-white font-bold text-[8px] sm:text-[10px] leading-none tracking-wider font-sans">BG</span>
            </div>

            {/* Text */}
            <div className={`flex-1 px-3 font-mono font-black tracking-widest text-black uppercase whitespace-nowrap text-center ${s.text} bg-white h-full flex items-center`}>
                {text}
            </div>
        </div>
    );
}
