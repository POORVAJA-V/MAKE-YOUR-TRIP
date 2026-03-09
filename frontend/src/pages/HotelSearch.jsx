import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { cardVariants, staggerContainer, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const HotelSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTo = queryParams.get('to') || '';

    const [query, setQuery] = useState(initialTo);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('recommended');
    const [hasSearched, setHasSearched] = useState(false);

    const sortedHotels = [...hotels].sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating_high') return b.rating - a.rating;
        return 0;
    });

    // Load random hotels on initial load
    useEffect(() => {
        loadRandomHotels();
    }, []);

    const loadRandomHotels = () => {
        setLoading(true);
        // Load hotels from multiple popular cities to show random results
        const popularCities = ['Mumbai', 'Delhi', 'Goa', 'Bangalore', 'Chennai', 'Jaipur', 'Kolkata', 'Hyderabad', 'Kerala', 'Agra'];
        const randomCity = popularCities[Math.floor(Math.random() * popularCities.length)];
        
        api.get(`/hotels/search?city=${encodeURIComponent(randomCity)}`)
            .then(res => { 
                setHotels(res.data); 
                setLoading(false);
                setHasSearched(true);
            })
            .catch(() => {
                // If API fails, generate dummy hotels locally
                setHotels(generateDummyHotels(randomCity));
                setLoading(false);
                setHasSearched(true);
            });
    };

    // Generate dummy hotels for display with unique photos
    const generateDummyHotels = (city) => {
        const hotelNames = ['Grand Palace Hotel', 'The Metropolitan', 'Royal Suites Resort', 'Comfort Inn', 'Luxury Stay', 'Heritage Hotel', 'City Center Hotel', 'Sunset Beach Resort'];
        const amenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Room Service'];
        
        // Unique hotel images
        const hotelImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=60'
        ];
        
        return Array.from({ length: 8 }, (_, i) => ({
            _id: `dummy-hotel-${city}-${i}`,
            name: `${hotelNames[i % hotelNames.length]}`,
            city: city,
            country: 'India',
            star: 3 + (i % 3),
            price: 1500 + (i * 500),
            images: [hotelImages[i], hotelImages[(i + 1) % hotelImages.length]],
            amenities: amenities.slice(i % 3, (i % 3) + 5),
            rating: 4.0 + (i % 10) / 10,
            description: `A beautiful hotel in ${city} with excellent amenities and service.`,
            reviews: [
                { user: 'Guest User', rating: 4, comment: 'Great stay!' }
            ]
        }));
    };

    // BUG 5: Race condition - loading state doesn't reset properly on rapid successive searches
    // The requestTimestamp is set but never used to validate responses, causing stale data display
    const search = (cityOverride) => {
        const city = cityOverride || query || 'Mumbai';
        const requestTimestamp = Date.now(); // Set timestamp but don't use it to validate
        setLoading(true);
        setQuery(city);
        api.get(`/hotels/search?city=${encodeURIComponent(city)}`)
            .then(res => { 
                // BUG: Missing check for requestTimestamp - stale requests can overwrite newer ones
                if (res.data && res.data.length > 0) {
                    setHotels(res.data);
                } else {
                    // If no results, generate dummy hotels
                    setHotels(generateDummyHotels(city));
                }
                // Always sets loading to false regardless of whether response is stale
                setLoading(false); 
            })
            .catch(() => {
                setHotels(generateDummyHotels(city));
                setLoading(false);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') search();
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            {/* Search Hero Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="relative w-full max-w-6xl mx-auto bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl mb-12 flex flex-col items-center justify-center p-12 md:p-20">
                <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay"></div>
                <img src="https://images.unsplash.com/photo-1542314831-c6a4d14d8343?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 object-cover w-full h-full opacity-40 mix-blend-luminosity" alt="Hotel Hero" />

                <div className="relative z-10 text-center w-full max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Find Your Perfect Stay</h2>

                    {/* Glass Search Bar */}
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                        <input
                            className="flex-1 p-5 rounded-xl bg-white/90 focus:bg-white text-slate-800 focus:ring-4 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-400 font-medium text-lg"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Where are you going? (e.g. Paris, London, Goa)"
                        />
                        <motion.button variants={btnVariants} whileHover="hover" whileTap="tap"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-xl font-bold text-lg shadow-lg" onClick={() => search()}>
                            Search
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Results Section */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-800">
                        {query ? `Search Results for "${query}"` : 'Recommended Properties'}
                    </h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="mt-4 md:mt-0 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 shadow-sm">
                        <option value="recommended">Recommended</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating_high">Rating: High to Low</option>
                    </select>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="animate-pulse w-full h-[400px] bg-slate-200 rounded-3xl" />)}
                    </div>
                ) : (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {sortedHotels.length === 0 ? (
                            <div className="col-span-3 py-20 text-center">
                                <div className="text-6xl mb-4">🏨</div>
                                <h3 className="text-2xl font-bold text-slate-700">No properties found</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            sortedHotels.map(h => (
                                <motion.div key={h._id} variants={cardVariants} whileHover="hover"
                                    className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden cursor-pointer border border-slate-100 group"
                                    onClick={() => navigate(`/hotels/${h._id}`, { state: { hotel: h } })}>

                                    <div className="relative overflow-hidden h-64">
                                        <img src={h.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=60'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={h.name} />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-sm shadow-md flex items-center">
                                            <span className="text-amber-500 mr-1">★</span> {h.rating}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{h.name}</h3>
                                        </div>
                                        <p className="text-slate-500 font-medium mb-6 flex items-center">
                                            <svg className="w-4 h-4 mr-1 pb-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                            {h.city}, {h.country || 'India'}
                                        </p>

                                        <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                                            <div>
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Price per night</span>
                                                <span className="font-black text-2xl text-slate-900">₹{h.price}</span>
                                            </div>
                                            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                                                View Deal
                                            </button>
                                        </div>
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
export default HotelSearch;
