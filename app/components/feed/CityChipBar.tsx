'use client';

interface CityChipBarProps {
    city: string;
    setCity: (c: string) => void;
}

const CITIES: { key: string; label: string; emoji: string }[] = [
    { key: '', label: 'Tất cả', emoji: '🏙️' },
    { key: 'Hồ Chí Minh', label: 'HCM', emoji: '🌆' },
    { key: 'Đà Nẵng', label: 'Đà Nẵng', emoji: '🏖️' },
    { key: 'Khánh Hòa', label: 'Khánh Hòa', emoji: '🌊' },
    { key: 'Hà Nội', label: 'Hà Nội', emoji: '🏛️' },
];

export function CityChipBar({ city, setCity }: CityChipBarProps) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {CITIES.map(({ key, label, emoji }) => {
                const isActive = city === key;
                return (
                    <button
                        key={key}
                        onClick={() => setCity(key)}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <span className="text-sm">{emoji}</span>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
