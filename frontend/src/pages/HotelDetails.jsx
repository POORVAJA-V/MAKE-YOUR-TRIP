import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);

    useEffect(() => {
        api.get(`/hotels/${id}`).then(res => setHotel(res.data)).catch(console.error);
    }, [id]);

    if (!hotel) return <PageWrapper><div className="animate-pulse w-full h-64 bg-gray-200 rounded-2xl"></div></PageWrapper>;

    return (
        <PageWrapper className="max-w-4xl mx-auto pt-24 pb-20">
            {hotel.images && hotel.images.length > 1 ? (
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <img src={hotel.images[0]} className="col-span-4 md:col-span-3 w-full h-96 object-cover rounded-3xl shadow-lg" alt="Hotel main" />
                    <div className="col-span-4 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
                        {hotel.images.slice(1, 3).map((img, i) => (
                            <img key={i} src={img} className="w-full h-44 object-cover rounded-2xl shadow-sm" alt="Hotel detail" />
                        ))}
                    </div>
                </div>
            ) : (
                <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60'} className="w-full h-96 object-cover rounded-3xl shadow-lg mb-8" alt="Hotel main" />
            )}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">{hotel.name}</h1>
                    <p className="text-gray-500 text-lg">📍 {hotel.city}, {hotel.country}</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">₹{hotel.price}<span className="text-sm text-gray-400">/night</span></p>
                    <motion.button variants={btnVariants} whileHover="hover" whileTap="tap" onClick={() => navigate('/checkout', { state: { item: hotel, type: 'Hotel' } })} className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg">Book Now</motion.button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
                <h3 className="text-xl font-bold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-4">
                    {hotel.amenities.map(a => <span key={a} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">{a}</span>)}
                </div>
            </div>
            {hotel.reviews && hotel.reviews.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border mb-8">
                    <h3 className="text-xl font-bold mb-4">Guest Reviews</h3>
                    <div className="space-y-4">
                        {hotel.reviews.map((r, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-800">{r.user}</span>
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold text-xs">★ {r.rating}/5</span>
                                </div>
                                <p className="text-slate-600 italic">"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};
export default HotelDetails;
