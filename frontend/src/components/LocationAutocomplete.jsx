
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Comprehensive list of Indian and international cities
const popularCities = [
    // Major Indian Cities
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Goa', 'Kochi',
    'Ahmedabad', 'Lucknow', 'Chandigarh', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Agra', 'Nashik',
    'Varanasi', 'Surat', 'Rajkot', 'Jammu', 'Shrinagar', 'Ludhiana', 'Amritsar', 'Dehradun', 'Haridwar', 'Rishikesh',
    'Mysore', 'Coimbatore', 'Madurai', 'Trivandrum', 'Bhubaneswar', 'Ranchi', 'Guwahati', 'Siliguri', 'Kanpur', 'Allahabad',
    'Ajmer', 'Jodhpur', 'Udaipur', 'Kota', 'Bilaspur', 'Raipur', 'Durg', 'Bhilai', 'Warangal', 'Gwalior',
    'Jabalpur', 'Erode', 'Vijayawada', 'Tiruchirappalli', 'Belgaum', 'Dhanbad', 'Amravati', 'Navi Mumbai', 'Thane', 'Visakhapatnam',
    // International Cities
    'Dubai', 'London', 'Paris', 'New York', 'Singapore', 'Bangkok', 'Tokyo', 'Sydney', 'Los Angeles', 'San Francisco',
    'Chicago', 'Toronto', 'Vancouver', 'Melbourne', 'Auckland', 'Hong Kong', 'Shanghai', 'Beijing', 'Seoul', 'Abu Dhabi',
    'Doha', 'Muscat', 'Kuwait', 'Riyadh', 'Jeddah', 'Cairo', 'Istanbul', 'Moscow', 'Berlin', 'Frankfurt',
    'Rome', 'Milan', 'Madrid', 'Barcelona', 'Amsterdam', 'Brussels', 'Vienna', 'Prague', 'Budapest', 'Warsaw',
    'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Reykjavik', 'Dublin', 'Manchester', 'Birmingham', 'Edinburgh', 'Lisbon',
    'Athens', 'Zurich', 'Geneva', 'Nice', 'Marseille', 'Lyon', 'Munich', 'Hamburg', 'Phuket', 'Krabi',
    'Chiang Mai', 'Bali', 'Jakarta', 'Kuala Lumpur', 'Manila', 'Hanoi', 'Ho Chi Minh City', 'Taipei', 'Osaka', 'Kyoto',
    'Nagoya', 'Sapporo', 'Fukuoka', 'Busan', 'Jeju', 'Macau', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Xian',
    'Hangzhou', 'Nanjing', 'Tianjin', 'Qingdao', 'Dalian', 'Xiamen', 'Changsha', 'Wuhan', 'Zhengzhou', 'Kunming'
];

const LocationAutocomplete = ({ placeholder, value, onChange, icon }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value);
        }
    }, [value]);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = popularCities.filter(city => 
                city.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8);
            setSuggestions(filtered);
        } else {
            setSuggestions(popularCities.slice(0, 8));
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (city) => {
        setQuery(city);
        onChange(city);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue);
        setIsOpen(true);
    };

    const showSuggestions = isFocused && suggestions.length > 0;

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <span className="text-xl mr-3 opacity-60">{icon || '📍'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 font-medium placeholder-slate-400 text-sm md:text-base w-full"
                    placeholder={placeholder || "Enter a city..."}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { setIsFocused(true); setIsOpen(true); }}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    autoComplete="off"
                />
            </div>

            <AnimatePresence>
                {showSuggestions && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((city, i) => (
                            <li key={i}
                                onClick={() => handleSelect(city)}
                                className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-center"
                            >
                                <span className="text-lg mr-3 opacity-50">📍</span>
                                <span className="font-medium text-slate-800 text-sm">{city}</span>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationAutocomplete;

