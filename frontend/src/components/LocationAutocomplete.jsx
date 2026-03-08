import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationAutocomplete = ({ placeholder, value, onChange, icon }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounced search to OpenStreetMap Nominatim API
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                // Using Nominatim for free global location data
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=city`);
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    useEffect(() => {
        // Click outside handler
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (suggestion) => {
        const placeName = suggestion.display_name.split(',')[0] + ', ' + suggestion.display_name.split(',').pop().trim();
        setQuery(placeName);
        onChange(placeName);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <span className="text-xl mr-3 opacity-60">{icon || '📍'}</span>
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 font-medium placeholder-slate-400 text-sm md:text-base"
                    placeholder={placeholder || "Enter a city..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length >= 3 && setIsOpen(true)}
                />
                {loading && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>

            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((s, i) => (
                            <li key={i}
                                onClick={() => handleSelect(s)}
                                className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex flex-col"
                            >
                                <span className="font-bold text-slate-800 text-sm">{s.display_name.split(',')[0]}</span>
                                <span className="text-xs text-slate-500 truncate">{s.display_name}</span>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationAutocomplete;
