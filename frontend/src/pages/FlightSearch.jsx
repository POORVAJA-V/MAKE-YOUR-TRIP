import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { cardVariants, staggerContainer, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const FlightSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTo = queryParams.get('to') || '';

    const [flights, setFlights] = useState([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState(initialTo);
    const [sortBy, setSortBy] = useState('recommended');
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    // List of valid cities for validation
    const validCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Goa', 'Kochi',
        'Ahmedabad', 'Lucknow', 'Chandigarh', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Agra', 'Nashik',
        'Varanasi', 'Surat', 'Dubai', 'London', 'Paris', 'New York', 'Singapore', 'Bangkok', 'Tokyo', 'Sydney',
        'Los Angeles', 'San Francisco', 'Chicago', 'Toronto', 'Vancouver', 'Melbourne', 'Auckland', 'Hong Kong',
        'Shanghai', 'Beijing', 'Seoul', 'Mumbai', 'Delhi'
    ];

    // BUG 4: Sort bug - 'recommended' and 'price_low' produce same results due to missing return
    // This bug causes inconsistent sorting behavior that's hard to spot visually
    const sortedFlights = [...flights].sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        // Missing return 0 here causes unpredictable sort order for 'recommended'
        return a.price - b.price; // This should be return 0 but it's returning price_low behavior
    });

    // Load random flights on initial load
    useEffect(() => {
        loadRandomFlights();
    }, []);

    const loadRandomFlights = () => {
        setLoading(true);
        const popularRoutes = [
            { from: 'Delhi', to: 'Mumbai' },
            { from: 'Bangalore', to: 'Chennai' },
            { from: 'Kolkata', to: 'Hyderabad' },
            { from: 'Pune', to: 'Goa' },
            { from: 'Jaipur', to: 'Delhi' }
        ];
        const randomRoute = popularRoutes[Math.floor(Math.random() * popularRoutes.length)];
        
        api.get(`/flights/search?from=${randomRoute.from}&to=${randomRoute.to}`)
            .then(res => {
                setFlights(res.data);
                setFrom(randomRoute.from);
                setTo(randomRoute.to);
                setLoading(false);
                setHasSearched(true);
            })
            .catch(() => {
                // Generate dummy flights if API fails
                setFlights(generateDummyFlights(randomRoute.from, randomRoute.to));
                setFrom(randomRoute.from);
                setTo(randomRoute.to);
                setLoading(false);
                setHasSearched(true);
            });
    };

    // Generate dummy flights
    const generateDummyFlights = (fromCity, toCity) => {
        const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Air Asia', 'Go First'];
        
        return Array.from({ length: 6 }, (_, i) => ({
            _id: `dummy-flight-${i}`,
            airline: airlines[i % airlines.length],
            flightNumber: `AI-${100 + i}`,
            departureCity: fromCity,
            arrivalCity: toCity,
            departureTime: new Date(Date.now() + (i + 1) * 3600000 * 6),
            arrivalTime: new Date(Date.now() + (i + 1) * 3600000 * 8),
            duration: `${2 + (i % 3)}h ${30 + (i * 10) % 60}m`,
            price: 2500 + (i * 500),
            availableSeats: 20 + (i * 5),
            baggage: '15 kg',
            refundable: i % 2 === 0
        }));
    };

    // Validate if a city exists
    const validateCity = (city) => {
        if (!city || city.trim() === '') return false;
        const normalizedCity = city.toLowerCase().trim();
        return validCities.some(valid => valid.toLowerCase() === normalizedCity);
    };

    const handleSearch = () => {
        setError('');
        
        // Validate both cities
        if (!from.trim()) {
            setError('Please enter departure city');
            return;
        }
        if (!to.trim()) {
            setError('Please enter destination city');
            return;
        }
        if (!validateCity(from)) {
            setError(`"${from}" is not a valid city. Please enter a valid city name.`);
            return;
        }
        if (!validateCity(to)) {
            setError(`"${to}" is not a valid city. Please enter a valid city name.`);
            return;
        }
        
        setLoading(true);
        setHasSearched(true);
        
        api.get(`/flights/search?from=${from}&to=${to}`)
            .then(res => {
                setFlights(res.data);
                setLoading(false);
            })
            .catch(() => {
                setFlights(generateDummyFlights(from, to));
                setLoading(false);
            });
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            {/* Search Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl mb-10 flex flex-col items-center justify-center p-8 md:p-10">
                <div className="absolute inset-0 bg-indigo-600/30 mix-blend-overlay"></div>
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-luminosity" alt="Flight Hero" />

                <div className="relative z-10 w-full">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 text-center">Ready for Takeoff?</h2>

                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500 text-white px-4 py-2 rounded-xl text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                        <input className="flex-1 p-3 rounded-xl bg-white/90 focus:bg-white text-slate-800 focus:ring-4 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-500 font-medium text-base"
                            value={from} onChange={e => { setFrom(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Leaving from..." />

                        <div className="hidden md:flex items-center justify-center bg-white/20 text-white rounded-full w-12 h-12 shadow-inner self-center mx-2">
                            <span className="text-xl">✈️</span>
                        </div>

                        <input className="flex-1 p-3 rounded-xl bg-white/90 focus:bg-white text-slate-800 focus:ring-4 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-500 font-medium text-base"
                            value={to} onChange={e => { setTo(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Going to..." />

                        <motion.button variants={btnVariants} whileHover="hover" whileTap="tap"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold text-base shadow-lg" onClick={handleSearch}>
                            Search
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Results Grid */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-end mb-6">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-sm">
                        <option value="recommended">Recommended</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
                </div>
                
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-slate-200 h-40 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
                        {sortedFlights.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="text-6xl mb-4 text-slate-300">✈️</div>
                                <h3 className="text-2xl font-bold text-slate-700">No flights found</h3>
                                <p className="text-slate-500 mt-2">Adjust your search parameters</p>
                            </div>
                        ) : (
                            sortedFlights.map(f => (
                                <motion.div key={f._id} variants={cardVariants} whileHover="hover"
                                    onClick={() => navigate(`/flights/${f._id}/seats`, { state: { flight: f } })}
                                    className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center cursor-pointer group">
                                    <div className="flex items-center w-full md:w-auto mb-6 md:mb-0">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mr-6 group-hover:bg-indigo-600 transition-colors">
                                            <span className="text-2xl group-hover:scale-125 transition-transform">✈️</span>
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors">{f.airline} <span className="text-sm font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-md ml-2">{f.flightNumber}</span></h3>
                                            <div className="flex items-center text-slate-800 font-bold text-xl mt-3">
                                                <span>{f.departureTime ? new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00'}</span>
                                                <div className="flex flex-col items-center mx-4">
                                                    <span className="text-xs text-slate-400 font-medium mb-1">{f.duration}</span>
                                                    <div className="w-16 h-[2px] bg-slate-200 relative">
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    </div>
                                                </div>
                                                <span>{f.arrivalTime ? new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30'}</span>
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm flex items-center mt-2">
                                                {f.departureCity} <span className="text-indigo-400 mx-2">⟶</span> {f.arrivalCity}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">Non-stop • {f.refundable ? 'Refundable' : 'Non-Refundable'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                                        <div className="text-left md:text-right">
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Per traveler</span>
                                            <span className="text-3xl font-black text-slate-900 block mb-4">₹{f.price}</span>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.05 }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-md">
                                            Select Seats
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </div>
        </PageWrapper>
    );
};
export default FlightSearch;
