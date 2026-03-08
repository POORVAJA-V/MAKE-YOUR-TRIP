import React from 'react';

const DateSelector = ({ label, value, onChange, minDate }) => {
    // Get today's date in YYYY-MM-DD format for the min attribute if minDate isn't provided
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="w-full flex-1">
            {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">{label}</label>}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all relative">
                <input
                    type="date"
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 font-bold text-sm md:text-base cursor-pointer"
                    value={value || today}
                    min={minDate || today}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default DateSelector;
