import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { cardVariants, staggerContainer, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DateSelector from '../components/DateSelector';

const BusFlow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTo = queryParams.get('to') || '';

    const [buses, setBuses] = useState([]);
    const [searchParams, setSearchParams] = useState({ from: '', to: initialTo, date: '' });
    const [sortBy, setSortBy] = useState('recommended');
    const [filterAC, setFilterAC] = useState(false);

    const sortedBuses = [...buses]
        .filter(b => !filterAC || b.amenities.includes('AC'))
        .filter(b => searchParams.from ? b.routeFrom.toLowerCase().includes(searchParams.from.toLowerCase()) : true)
        .filter(b => searchParams.to ? b.routeTo.toLowerCase().includes(searchParams.to.toLowerCase()) : true)
        .sort((a, b) => {
            if (sortBy === 'price_low') return a.price - b.price;
            if (sortBy === 'price_high') return b.price - a.price;
            return 0;
        });

    useEffect(() => {
        api.get('/buses/search').then(res => setBuses(res.data));
    }, []);

    return (
        <PageWrapper className="pt-24 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 px-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm tracking-widest uppercase mb-4 shadow-sm border border-orange-200">
                    🚌 Interstate Travel
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Premium Bus Routes</h2>
                <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto font-medium">Comfortable AC Volvos, sleepers, and luxury coaches for your cross-country journeys.</p>

                <div className="mt-10 max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 items-center relative z-20">
                    <LocationAutocomplete placeholder="From City..." value={searchParams.from} onChange={(val) => setSearchParams({ ...searchParams, from: val })} icon="📍" />
                    <LocationAutocomplete placeholder="To City..." value={searchParams.to} onChange={(val) => setSearchParams({ ...searchParams, to: val })} icon="🛑" />
                    <DateSelector value={searchParams.date} onChange={(val) => setSearchParams({ ...searchParams, date: val })} />
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4">
                {searchParams.date && (
                    <div className="mb-6 bg-emerald-50 text-emerald-800 px-6 py-4 rounded-xl border border-emerald-100 font-medium">
                        Showing buses available for <strong>{searchParams.date}</strong>.
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-white p-5 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                    <label className="flex items-center space-x-3 font-bold text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                        <input type="checkbox" checked={filterAC} onChange={e => setFilterAC(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded cursor-pointer" />
                        <span>AC Buses Only</span>
                    </label>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        <span className="text-slate-500 font-medium text-sm">Sort by:</span>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-slate-100 transition-colors">
                            <option value="recommended">Recommended</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sortedBuses.length === 0 ? (
                        <div className="col-span-2 py-20 text-center">
                            <div className="animate-pulse w-full h-[200px] bg-slate-200 rounded-3xl mb-6 flex justify-center items-center text-4xl">🚌</div>
                        </div>
                    ) : (
                        sortedBuses.map((b, i) => (
                            <motion.div key={b._id} variants={cardVariants} whileHover="hover"
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group h-full">

                                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 ease-in-out"></div>

                                <div className="relative z-10 w-full mb-6 flex-grow flex flex-col">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl shadow-md mr-4 group-hover:scale-110 transition-transform">
                                            {i % 2 === 0 ? '🚍' : '🚎'}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-2xl text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">{b.operator}</h3>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">AC Sleeper (2+1)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 w-full relative z-20 flex-grow">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xl font-black text-slate-800">{b.departureTime ? new Date(b.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '20:30'}</p>
                                                <p className="text-sm font-bold text-slate-500">{b.routeFrom}</p>
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-xs text-slate-400 font-bold mb-1">8h 00m</p>
                                                <div className="w-16 h-[2px] bg-slate-200 relative">
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400"></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-800">{b.arrivalTime ? new Date(b.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '04:30'}</p>
                                                <p className="text-sm font-bold text-slate-500">{b.routeTo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-row items-center justify-between border-t border-slate-100 pt-6 mt-2">
                                    <div className="text-left">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Starting from</span>
                                        <span className="font-black text-3xl text-slate-900 block">₹{b.price}</span>
                                    </div>
                                    <motion.button variants={btnVariants} whileHover="hover" whileTap="tap"
                                        onClick={() => navigate('/bus-seats', { state: { type: 'Bus', item: b } })}
                                        className="bg-slate-900 text-white hover:bg-orange-500 hover:text-orange-950 px-6 py-3 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap">
                                        Select Seats
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </PageWrapper>
    );
};
export default BusFlow;
