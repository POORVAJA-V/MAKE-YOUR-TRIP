import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { btnVariants } from '../utils/animations';

const FlightSeatSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const flightParams = location.state?.flight || {};

    // Generate realistic seat map
    const generateSeats = () => {
        return [...Array(30)].map((_, i) => ({
            id: i,
            type: i < 12 ? 'Premium' : 'Standard',
            // Randomly occupy some seats, make standard a bit occupied
            status: Math.random() > 0.6 ? 'Occupied' : 'Available',
            price: i < 12 ? (flightParams.price || 5000) + 1500 : (flightParams.price || 5000)
        }));
    };

    const [seats] = useState(generateSeats());

    const handleSeatSelect = (seatIndex) => {
        if (seats[seatIndex].status === 'Occupied') return;

        if (selectedSeats.includes(seatIndex)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatIndex));
        } else {
            if (selectedSeats.length >= 6) {
                alert("Maximum 6 seats allowed per booking");
                return;
            }
            setSelectedSeats([...selectedSeats, seatIndex]);
        }
    };

    return (
        <PageWrapper className="flex flex-col items-center pt-24 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm tracking-widest uppercase mb-4 shadow-sm border border-indigo-200">
                    Step 2
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Select Your Seat</h2>
                <p className="text-lg text-slate-500 mt-4 font-medium">Flight {flightParams.flightNumber || 'FLX'} • {flightParams.departureCity || 'Origin'} to {flightParams.arrivalCity || 'Destination'}</p>
            </motion.div>

            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 relative overflow-hidden flex flex-col md:flex-row gap-12">

                <div className="w-full md:w-64 space-y-6 flex-shrink-0">
                    <h3 className="text-xl font-bold border-b pb-4">Trip Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Standard</span>
                            <span className="font-bold text-slate-900">₹{flightParams.price || 5000}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <span className="text-slate-500 font-medium flex items-center"><span className="w-3 h-3 rounded-full bg-amber-200 mr-2"></span>Premium (Front)</span>
                            <span className="font-bold text-slate-900">₹{(flightParams.price || 5000) + 1500}</span>
                        </div>
                    </div>
                    {/* Seat Legend */}
                    <div className="space-y-3 mt-8">
                        <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-2">Legend</h4>
                        <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-white border border-slate-200 mr-3"></div> Available</div>
                        <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-amber-100 border border-amber-300 mr-3"></div> Premium</div>
                        <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-slate-200 border border-slate-300 mr-3"></div> Occupied</div>
                        <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-indigo-500 mr-3 shadow-sm"></div> Selected</div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto">
                    {/* Airplane shape background elements */}
                    <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 w-[120%] h-[150px] bg-indigo-50/50 rounded-b-[100px] pointer-events-none"></div>

                    {/* Seat Map */}
                    <div className="grid grid-cols-6 gap-x-4 gap-y-3 max-w-md relative z-10 pt-8">
                        {seats.map((seat, i) => {
                            const isAisle = i % 6 === 2;
                            const isSelected = selectedSeats.includes(i);

                            let seatClass = 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50';
                            if (seat.status === 'Occupied') {
                                seatClass = 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed';
                            } else if (isSelected) {
                                seatClass = 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white shadow-indigo-500/40 shadow-lg scale-110';
                            } else if (seat.type === 'Premium') {
                                seatClass = 'bg-amber-100 border-amber-300 text-amber-700 hover:border-indigo-400 hover:bg-amber-200';
                            }

                            return (
                                <motion.div key={i} whileHover={seat.status !== 'Occupied' ? { y: -2, scale: 1.05 } : {}} whileTap={seat.status !== 'Occupied' ? { scale: 0.95 } : {}} onClick={() => handleSeatSelect(i)}
                                    className={`w-10 h-10 rounded-t-xl rounded-b-md border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                                        ${seatClass}
                                        ${seat.status !== 'Occupied' ? 'cursor-pointer' : ''}
                                        ${isAisle ? 'mr-8' : ''}
                                    `}>
                                    {i + 1}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-12 w-full flex flex-col items-center">
                {selectedSeats.length > 0 && (
                    <motion.button variants={btnVariants} initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                        whileHover="hover" whileTap="tap"
                        onClick={() => navigate('/checkout', { state: { type: 'Flight', seats: selectedSeats, item: { ...flightParams, price: selectedSeats.reduce((acc, idx) => acc + seats[idx].price, 0) } } })}
                        className="bg-slate-900 text-white font-bold text-lg py-4 px-12 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-indigo-600 transition-colors">
                        Continue - ₹{selectedSeats.reduce((acc, idx) => acc + seats[idx].price, 0)} ({selectedSeats.length} seats)
                    </motion.button>
                )}
            </div>
        </PageWrapper>
    );
};
export default FlightSeatSelection;
