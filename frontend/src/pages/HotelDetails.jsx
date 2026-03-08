import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
        // First check if hotel data was passed via navigation state
        if (location.state?.hotel) {
            setHotel(location.state.hotel);
            setRooms(generateRooms(location.state.hotel));
            setLoading(false);
            return;
        }
        
        // Otherwise fetch from API
        api.get(`/hotels/${id}`)
            .then(res => {
                setHotel(res.data);
                setRooms(generateRooms(res.data));
                setLoading(false);
            })
            .catch(() => {
                // Generate dummy hotel if not found
                const dummyHotel = generateDummyHotel(id);
                setHotel(dummyHotel);
                setRooms(generateRooms(dummyHotel));
                setLoading(false);
            });
    }, [id, location.state]);

    // Generate dummy hotel data
    const generateDummyHotel = (id) => {
        return {
            _id: id,
            name: 'Grand Palace Hotel',
            city: 'Mumbai',
            country: 'India',
            star: 5,
            price: 3500,
            images: [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60'
            ],
            amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Room Service'],
            rating: 4.5,
            description: 'A beautiful hotel with excellent amenities and service.',
            reviews: [
                { user: 'John D.', rating: 5, comment: 'Amazing stay!' },
                { user: 'Sarah M.', rating: 4, comment: 'Great location and service.' }
            ]
        };
    };

    // Generate rooms for the hotel
    const generateRooms = (hotelData) => {
        const roomTypes = [
            { type: 'Standard Room', basePrice: hotelData.price || 1500, capacity: 2 },
            { type: 'Deluxe Room', basePrice: (hotelData.price || 1500) + 1500, capacity: 2 },
            { type: 'Suite', basePrice: (hotelData.price || 1500) + 3000, capacity: 4 },
            { type: 'Premium Suite', basePrice: (hotelData.price || 1500) + 5000, capacity: 4 },
            { type: 'Family Room', basePrice: (hotelData.price || 1500) + 2500, capacity: 6 }
        ];

        return roomTypes.map((room, index) => ({
            id: `room-${index}`,
            type: room.type,
            available: Math.random() > 0.3, // 70% chance available
            price: room.basePrice,
            capacity: room.capacity,
            amenities: ['AC', 'TV', 'WiFi', 'Hot Water'],
            bedType: index < 2 ? 'Double Bed' : 'King Bed',
            view: ['City View', 'Pool View', 'Garden View'][index % 3]
        }));
    };

    const handleBookRoom = (room) => {
        if (!room.available) {
            alert('This room is not available');
            return;
        }
        const bookingItem = {
            ...hotel,
            roomType: room.type,
            price: room.price,
            capacity: room.capacity
        };
        navigate('/checkout', { state: { item: bookingItem, type: 'Hotel' } });
    };

    if (loading) {
        return <PageWrapper><div className="animate-pulse w-full h-64 bg-gray-200 rounded-2xl mt-24"></div></PageWrapper>;
    }

    if (!hotel) return <PageWrapper><div className="pt-24 text-center">Hotel not found</div></PageWrapper>;

    return (
        <PageWrapper className="max-w-6xl mx-auto pt-24 pb-20">
            {/* Image Gallery */}
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
                <img src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60'} className="w-full h-96 object-cover rounded-3xl shadow-lg mb-8" alt="Hotel main" />
            )}

            {/* Hotel Info */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">{hotel.name}</h1>
                    <p className="text-gray-500 text-lg">📍 {hotel.city}, {hotel.country}</p>
                    <div className="flex items-center mt-2">
                        <span className="text-amber-500 text-lg mr-1">★</span>
                        <span className="font-bold">{hotel.rating}</span>
                        <span className="text-gray-400 ml-1">({hotel.reviews?.length || 0} reviews)</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">₹{hotel.price}<span className="text-sm text-gray-400">/night</span></p>
                </div>
            </div>

            {/* Description */}
            {hotel.description && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
                    <h3 className="text-xl font-bold mb-4">About This Hotel</h3>
                    <p className="text-slate-600">{hotel.description}</p>
                </div>
            )}

            {/* Amenities */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
                <h3 className="text-xl font-bold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-4">
                    {hotel.amenities?.map(a => (
                        <span key={a} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">{a}</span>
                    ))}
                </div>
            </div>

            {/* Room Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
                <h3 className="text-xl font-bold mb-6">Room Types & Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className={`border-2 rounded-2xl p-5 ${room.available ? 'border-slate-200 hover:border-blue-400' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-lg text-slate-800">{room.type}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {room.available ? 'Available' : 'Sold Out'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                <p>👥 Capacity: {room.capacity} guests</p>
                                <p>🛏️ Bed: {room.bedType}</p>
                                <p>🌅 View: {room.view}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {room.amenities.map(am => (
                                        <span key={am} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{am}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <div>
                                    <span className="text-xs text-slate-400 font-bold">Starting from</span>
                                    <p className="text-2xl font-black text-slate-900">₹{room.price}<span className="text-sm font-normal">/night</span></p>
                                </div>
                                <motion.button 
                                    variants={btnVariants} 
                                    whileHover="hover" 
                                    whileTap="tap"
                                    onClick={() => handleBookRoom(room)}
                                    disabled={!room.available}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm ${room.available ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {room.available ? 'Book Now' : 'Unavailable'}
                                </motion.button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews */}
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
