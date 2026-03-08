import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, cardVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const BusSeatSelection = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);

    if (!state || !state.item) {
        return <div className="text-center mt-20 text-2xl">Invalid Routing. Go back and select a bus.</div>;
    }

    const { item } = state;

    // Generate a 2x2 layout of 40 seats (dummy data) only once
    const [seats] = useState(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i + 1,
            // E.g. Lower deck vs upper deck sleeper premium
            type: i < 8 ? 'Premium' : 'Standard',
            // Randomly occupy some seats, make standard a bit occupied
            status: Math.random() > 0.7 ? 'Occupied' : 'Available',
            price: i < 8 ? item.price + 200 : item.price
        }))
    );

    const handleSeatClick = (seat) => {
        if (seat.status === 'Occupied') return;
        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 6) {
                alert("Maximum 6 seats allowed per booking");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;

        // Ensure total price is calculated per seat
        const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

        navigate('/checkout', {
            state: {
                type: 'Bus',
                item: { ...item, price: totalPrice },
                seats: selectedSeats.map(s => s.id)
            }
        });
    };

    const getSeatClass = (seat) => {
        if (seat.status === 'Occupied') return 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300';
        if (selectedSeats.find(s => s.id === seat.id)) return 'bg-orange-500 text-white border-orange-600 shadow-md transform scale-105';
        if (seat.type === 'Premium') return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300';
        return 'bg-white text-slate-700 hover:bg-orange-100 border-slate-200';
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Trip Details Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10"></div>
                        <h2 className="text-2xl font-black mb-2 relative z-10">{item.operator}</h2>
                        <p className="text-slate-500 font-medium mb-6 relative z-10">{item.routeFrom} &rarr; {item.routeTo}</p>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Standard</span>
                                <span className="font-bold text-slate-900">₹{item.price}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <span className="text-slate-500 font-medium flex items-center"><span className="w-3 h-3 rounded-full bg-amber-200 mr-2"></span>Premium Sleeper</span>
                                <span className="font-bold text-slate-900">₹{item.price + 200}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-8 space-y-3 relative z-10">
                            <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-2">Legend</h4>
                            <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-white border border-slate-200 mr-3"></div> Available</div>
                            <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-amber-100 border border-amber-300 mr-3"></div> Premium</div>
                            <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-slate-300 mr-3"></div> Occupied</div>
                            <div className="flex items-center text-sm font-medium"><div className="w-5 h-5 rounded bg-orange-500 mr-3"></div> Selected</div>
                        </div>
                    </div>

                    {/* Floating Action Bar */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <span className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Amount</span>
                                <span className="text-3xl font-black">₹{selectedSeats.reduce((a, s) => a + s.price, 0)}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-slate-400 text-sm font-medium mb-1">Seats</span>
                                <span className="text-xl font-bold">{selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : '-'}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleProceed}
                            disabled={selectedSeats.length === 0}
                            className={`w-full py-4 rounded-xl font-bold transition-colors ${selectedSeats.length > 0 ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                            Proceed to Book
                        </button>
                    </div>
                </div>

                {/* Seat Map Column */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm flex justify-center">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-3xl">🛞</span>
                            <div className="text-center font-black text-slate-300 tracking-widest uppercase">FRONT</div>
                            <span className="text-2xl opacity-50">🚪</span>
                        </div>

                        {/* Rendering 4 columns (2 left, aisle, 2 right) */}
                        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
                            {seats.map((seat, index) => {
                                // Add aisle gap after column 2
                                const isAisle = (index % 4 === 2);
                                return (
                                    <React.Fragment key={seat.id}>
                                        {isAisle && <div className="w-8"></div>}
                                        <div
                                            onClick={() => handleSeatClick(seat)}
                                            className={`
                                                w-10 h-10 cursor-pointer rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all
                                                ${getSeatClass(seat)}
                                            `}
                                        >
                                            {seat.id}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </PageWrapper>
    );
};

export default BusSeatSelection;
