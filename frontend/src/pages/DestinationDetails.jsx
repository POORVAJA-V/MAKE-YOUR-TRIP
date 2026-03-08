import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { cardVariants, staggerContainer } from '../utils/animations';
import api from '../utils/api';

const DestinationDetails = () => {
    const { city } = useParams();
    const navigate = useNavigate();
    const decodedCity = decodeURIComponent(city);
    const [hotels, setHotels] = useState([]);
    const [loadingHotels, setLoadingHotels] = useState(true);

    const destinationsData = {
        'Bali': {
            img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
            description: "Bali is a living postcard, an Indonesian paradise that feels like a fantasy. Soak up the sun on a stretch of fine white sand, or commune with the tropical creatures as you dive along coral ridges.",
            attractions: ["Uluwatu Temple", "Tegallalang Rice Terrace", "Sacred Monkey Forest"],
            bestTime: "April to October"
        },
        'Paris': {
            img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
            description: "Paris, France's capital, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.",
            attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral"],
            bestTime: "June to August"
        },
        'Kyoto': {
            img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
            description: "Kyoto, once the capital of Japan, is a city on the island of Honshu. It's famous for its numerous classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
            attractions: ["Fushimi Inari Taisha", "Kinkaku-ji", "Arashiyama Bamboo Grove"],
            bestTime: "March to May (Cherry Blossoms)"
        },
        'Santorini': {
            img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1200&q=80',
            description: "Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape.",
            attractions: ["Oia Postcards", "Akrotiri Ruins", "Red Beach"],
            bestTime: "September to October"
        },
        'Maldives': {
            img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
            description: "The Maldives is a tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands. It's known for its beaches, blue lagoons, and extensive reefs.",
            attractions: ["Maafushi", "Male Atoll", "Banana Reef"],
            bestTime: "November to April"
        },
        'Dubai': {
            img: 'https://wallpaperaccess.com/full/222689.jpg',
            description: "Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture, and a lively nightlife scene.",
            attractions: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
            bestTime: "November to March"
        }
    };

    const destInfo = destinationsData[decodedCity] || {
        img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
        description: `Explore the vibrant culture, stunning landscapes, and unforgettable experiences that ${decodedCity} has to offer. A perfect getaway for families, couples, and solo travelers alike.`,
        attractions: ["City Center", "Local Markets", "Historical Landmarks"],
        bestTime: "Year-round"
    };

    // Fetch hotels for this destination
    useEffect(() => {
        setLoadingHotels(true);
        api.get(`/hotels/search?city=${encodeURIComponent(decodedCity)}`)
            .then(res => {
                setHotels(res.data);
                setLoadingHotels(false);
            })
            .catch(() => {
                // Generate dummy hotels if API fails
                setHotels(generateDummyHotels(decodedCity));
                setLoadingHotels(false);
            });
    }, [decodedCity]);

    const generateDummyHotels = (city) => {
        const hotelNames = ['Grand Palace Hotel', 'The Metropolitan', 'Royal Suites Resort', 'Comfort Inn', 'Luxury Stay', 'Heritage Hotel'];
        const amenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Room Service'];
        
        return Array.from({ length: 6 }, (_, i) => ({
            _id: `dest-hotel-${i}`,
            name: `${hotelNames[i % hotelNames.length]}`,
            city: city,
            country: 'India',
            star: 3 + (i % 3),
            price: 1500 + (i * 500),
            images: [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=60',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=60'
            ],
            amenities: amenities.slice(i % 3, (i % 3) + 5),
            rating: 4.0 + (i % 10) / 10,
            description: `A beautiful hotel in ${city} with excellent amenities and service.`,
            reviews: [
                { user: 'Guest User', rating: 4, comment: 'Great stay!' }
            ]
        }));
    };

    const bgImg = destInfo.img;

    return (
        <PageWrapper className="pt-20">
            <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden mb-12">
                <img src={bgImg} alt={decodedCity} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-sm transition">
                    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-xl text-center px-4">
                        Discover {decodedCity}
                    </motion.h1>
                </div>
            </div>

            {/* Destination Details Section */}
            <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                <h2 className="text-3xl font-bold mb-6 text-slate-800">About {decodedCity}</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">{destInfo.description}</p>

                <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 mb-16">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 w-full md:w-1/2 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                        <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center justify-center relative z-10"><span className="text-2xl mr-3">⭐</span> Top Attractions</h3>
                        <ul className="text-slate-600 font-bold space-y-3 relative z-10 text-left pl-4 md:pl-10">
                            {destInfo.attractions.map((attr, idx) => (
                                <li key={idx} className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></span>{attr}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 w-full md:w-1/2 flex flex-col justify-center shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-100 rounded-br-full -ml-8 -mt-8 transition-transform group-hover:scale-150"></div>
                        <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center justify-center relative z-10"><span className="text-2xl mr-3">🌤️</span> Best Time to Visit</h3>
                        <p className="text-emerald-700 bg-emerald-50 py-3 px-6 rounded-xl font-bold text-lg inline-block mx-auto relative z-10 shadow-sm border border-emerald-100 mt-2">{destInfo.bestTime}</p>
                    </div>
                </div>
            </div>

            {/* Hotels Section */}
            <div className="max-w-6xl mx-auto px-4 mb-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Hotels in {decodedCity}</h2>
                    <button onClick={() => navigate(`/hotels?to=${encodeURIComponent(decodedCity)}`)} className="text-blue-600 font-bold hover:text-blue-800">
                        View All →
                    </button>
                </div>
                
                {loadingHotels ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-slate-200 rounded-2xl h-64"></div>
                        ))}
                    </div>
                ) : hotels.length > 0 ? (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hotels.slice(0, 6).map(h => (
                            <motion.div key={h._id} variants={cardVariants} whileHover="hover"
                                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-slate-100 group"
                                onClick={() => navigate(`/hotels/${h._id}`)}>
                                <div className="relative h-48">
                                    <img src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=60'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={h.name} />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full font-bold text-sm flex items-center">
                                        <span className="text-amber-500 mr-1">★</span> {h.rating}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{h.name}</h3>
                                    <p className="text-slate-500 text-sm mb-3">{h.city}, {h.country || 'India'}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black text-slate-900">₹{h.price}<span className="text-sm font-normal">/night</span></span>
                                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl">
                        <p className="text-slate-500 font-medium">No hotels found in {decodedCity}</p>
                    </div>
                )}
            </div>

            {/* Transport Options */}
            <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                <h2 className="text-3xl font-bold mb-8">How would you like to travel?</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" onClick={() => navigate('/flights?to=' + encodeURIComponent(decodedCity))} className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 cursor-pointer group">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✈️</div>
                        <h3 className="text-xl font-bold text-slate-800">Flights</h3>
                        <p className="text-slate-500 font-medium mt-2">Book luxury flights.</p>
                    </motion.div>
                    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" onClick={() => navigate('/trains?to=' + encodeURIComponent(decodedCity))} className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 cursor-pointer group">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚆</div>
                        <h3 className="text-xl font-bold text-slate-800">Trains</h3>
                        <p className="text-slate-500 font-medium mt-2">Scenic rail journeys.</p>
                    </motion.div>
                    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" onClick={() => navigate('/buses?to=' + encodeURIComponent(decodedCity))} className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 cursor-pointer group">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚌</div>
                        <h3 className="text-xl font-bold text-slate-800">Buses</h3>
                        <p className="text-slate-500 font-medium mt-2">Economical luxury buses.</p>
                    </motion.div>
                    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" onClick={() => navigate('/cabs?to=' + encodeURIComponent(decodedCity))} className="bg-white p-8 rounded-3xl shadow-xl border border-rose-100 cursor-pointer group">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚕</div>
                        <h3 className="text-xl font-bold text-slate-800">Cabs</h3>
                        <p className="text-slate-500 font-medium mt-2">Point-to-point transfers.</p>
                    </motion.div>
                </div>
            </div>
        </PageWrapper>
    );
};
export default DestinationDetails;
