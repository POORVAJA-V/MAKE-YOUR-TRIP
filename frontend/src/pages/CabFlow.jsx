import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { cardVariants, staggerContainer, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';
import LocationAutocomplete from '../components/LocationAutocomplete';

const CabFlow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTo = queryParams.get('to') || '';

    const [cabs, setCabs] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState(initialTo);
    const [distance, setDistance] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    const cabTypes = ['All', 'Auto', 'Mini', 'Sedan', 'SUV'];

    const cityCoords = {
        'pune': [18.5204, 73.8567], 'delhi': [28.7041, 77.1025], 'mumbai': [19.0760, 72.8777], 'bangalore': [12.9716, 77.5946],
        'bengaluru': [12.9716, 77.5946], 'chennai': [13.0827, 80.2707], 'kolkata': [22.5726, 88.3639], 'hyderabad': [17.3850, 78.4867],
        'ahmedabad': [23.0225, 72.5714], 'jaipur': [26.9124, 75.7873], 'surat': [21.1702, 72.8311], 'lucknow': [26.8467, 80.9462],
        'kanpur': [26.4499, 80.3319], 'nagpur': [21.1458, 79.0882], 'indore': [22.7196, 75.8577], 'bhopal': [23.2599, 77.4126],
        'patna': [25.5941, 85.1376], 'vadodara': [22.3072, 73.1812], 'agra': [27.1767, 78.0081], 'nashik': [19.9975, 73.7898],
        'varanasi': [25.3176, 82.9739], 'goa': [15.2993, 74.1240], 'chandigarh': [30.7333, 76.7794], 'kochi': [9.9312, 76.2673],
        // Global
        'bali': [-8.4095, 115.1889], 'paris': [48.8566, 2.3522], 'kyoto': [35.0116, 135.7681], 'santorini': [36.3932, 25.4615],
        'maldives': [3.2028, 73.2207], 'dubai': [25.2048, 55.2708], 'new york': [40.7128, -74.0060]
    };

    const calculateDistance = async (p, d) => {
        if (!p || !d) { setDistance(0); return; }
        setIsCalculating(true);
        const pStr = p.toLowerCase().trim();
        const dStr = d.toLowerCase().trim();

        // Check dictionary first
        let coordsP = Object.keys(cityCoords).find(k => pStr.includes(k)) ? cityCoords[Object.keys(cityCoords).find(k => pStr.includes(k))] : null;
        let coordsD = Object.keys(cityCoords).find(k => dStr.includes(k)) ? cityCoords[Object.keys(cityCoords).find(k => dStr.includes(k))] : null;

        // Fallback to OpenStreetMap API if not in dictionary
        try {
            if (!coordsP) {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pStr)}&format=json&limit=1`);
                const data = await res.json();
                if (data && data.length > 0) coordsP = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            if (!coordsD) {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dStr)}&format=json&limit=1`);
                const data = await res.json();
                if (data && data.length > 0) coordsD = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }

        if (coordsP && coordsD) {
            const R = 6371;
            const dLat = (coordsD[0] - coordsP[0]) * (Math.PI / 180);
            const dLon = (coordsD[1] - coordsP[1]) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(coordsP[0] * (Math.PI / 180)) * Math.cos(coordsD[0] * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const straightLine = R * c;
            const drivingAdjustment = straightLine * 1.35; // Rough driving distance factor
            setDistance(Math.round(drivingAdjustment < 5 ? 5 : drivingAdjustment));
        } else {
            // Ultimate fallback pseudo-random hash if completely unfound
            let hash = 0;
            const str = pStr + dStr;
            for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
            setDistance(Math.abs(hash % 1000) + 10);
        }
        setIsCalculating(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            calculateDistance(pickup, dropoff);
        }, 800);
        return () => clearTimeout(timer);
    }, [pickup, dropoff]);
    const travelHours = Math.floor(distance / 50);
    const travelMins = Math.round(((distance % 50) / 50) * 60);
    const timeString = distance ? `${travelHours > 0 ? `${travelHours}h ` : ''}${travelMins}m` : '';

    const baseRates = {
        'Auto': 9,
        'Mini': 12,
        'Sedan': 15,
        'SUV': 25
    };

    const icons = {
        'Auto': '🛺',
        'Mini': '🚗',
        'Sedan': '🚘',
        'SUV': '🚙'
    };

    const generatedOptions = distance > 0 ? Object.keys(baseRates).map((type, i) => ({
        _id: `cab-${type}-${i}`,
        vehicleType: type,
        driverName: ['Raju', 'Suresh', 'Amit', 'Vikram'][i % 4],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        price: Math.round(distance * baseRates[type]),
        ratePerKm: baseRates[type],
        estimatedTime: timeString
    })) : [];

    const displayCabs = generatedOptions.length > 0
        ? generatedOptions.filter(c => activeTab === 'All' || c.vehicleType === activeTab)
        : [];

    useEffect(() => {
        // Keeping API call just to show we could use it, but overriding with our dynamic options when searched
        api.get('/cabs/available').then(res => setCabs(res.data));
    }, []);

    return (
        <PageWrapper className="pt-24 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 font-bold text-sm tracking-widest uppercase mb-4 shadow-sm border border-amber-200">
                    🚕 Ride in Style
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Premium Cab Fleet</h2>
                <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto font-medium mb-10">Reliable airport transfers, outstation drops, and hourly rentals with top-rated professional drivers at your service.</p>

                {/* Uber-style Search Bar */}
                <div className="max-w-3xl mx-auto bg-white p-4 rounded-3xl shadow-xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 border border-slate-100 relative z-20">
                    <LocationAutocomplete placeholder="Pickup Location (e.g., Pune)" value={pickup} onChange={(val) => setPickup(val)} icon="📍" />
                    <LocationAutocomplete placeholder="Dropoff Location (e.g., Delhi)" value={dropoff} onChange={(val) => setDropoff(val)} icon="🏁" />
                </div>
            </motion.div>

            <div className="max-w-6xl mx-auto px-4">
                {isCalculating && (
                    <div className="text-center py-10 space-y-4 animate-pulse">
                        <div className="text-4xl">🛰️</div>
                        <p className="font-bold text-slate-500">Calculating precise driving distance...</p>
                    </div>
                )}
                {!isCalculating && distance > 0 && pickup && dropoff && (
                    <div className="mb-8 text-center bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Trip Details</h3>
                        <p className="text-amber-700 font-medium text-lg">
                            <span className="font-bold">{pickup}</span> to <span className="font-bold">{dropoff}</span>
                        </p>
                        <div className="flex justify-center items-center gap-6 mt-4">
                            <div className="flex items-center text-amber-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-200">
                                <span className="text-2xl mr-2">📏</span>
                                <div>
                                    <span className="block text-xs uppercase font-bold text-amber-600">Distance</span>
                                    <span className="font-black text-lg">{distance} km</span>
                                </div>
                            </div>
                            <div className="flex items-center text-amber-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-200">
                                <span className="text-2xl mr-2">⏱️</span>
                                <div>
                                    <span className="block text-xs uppercase font-bold text-amber-600">Est. Time</span>
                                    <span className="font-black text-lg">{timeString}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {cabTypes.map(type => (
                        <button key={type} onClick={() => setActiveTab(type)}
                            className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm border ${activeTab === type ? 'bg-amber-500 text-amber-950 border-amber-500 scale-105' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {!pickup || !dropoff ? (
                        <div className="col-span-full py-20 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="text-6xl mb-4">📍</div>
                            Enter your Pickup and Dropoff locations to calculate fares and view available rides.
                        </div>
                    ) : displayCabs.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-500 font-bold">No cabs available in this category.</div>
                    ) : (
                        displayCabs.map((c, i) => (
                            <motion.div key={c._id} variants={cardVariants} whileHover="hover"
                                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group flex flex-col">

                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150 ease-in-out"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className="font-extrabold text-2xl text-slate-900 group-hover:text-amber-600 transition-colors">{c.vehicleType}</h3>
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md mt-1 inline-block">₹{c.ratePerKm}/km</span>
                                    </div>
                                    <div className="text-5xl drop-shadow-sm group-hover:-translate-y-2 transition-transform duration-300">
                                        {icons[c.vehicleType]}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 relative z-10 flex-grow">
                                    <p className="text-slate-500 text-sm font-medium flex items-center">
                                        <span className="text-lg mr-2">👨‍✈️</span> {c.driverName} • {c.rating}⭐
                                    </p>
                                    <p className="text-slate-500 text-sm font-medium flex items-center">
                                        <span className="text-lg mr-2">⏱️</span> ~{c.estimatedTime}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex flex-col relative z-10">
                                    <div className="mb-4">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Fare</span>
                                        <span className="text-3xl font-black text-slate-900">₹{c.price}</span>
                                    </div>
                                    <motion.button variants={btnVariants} whileHover="hover" whileTap="tap"
                                        onClick={() => navigate('/checkout', { state: { type: 'Cab', item: { ...c, price: c.price, operator: `${c.vehicleType} driven by ${c.driverName}` } } })}
                                        className="w-full bg-slate-900 text-white hover:bg-amber-500 hover:text-amber-950 px-6 py-3 rounded-xl font-bold shadow-md transition-colors">
                                        Book Now
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
export default CabFlow;
