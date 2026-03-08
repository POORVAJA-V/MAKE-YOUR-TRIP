import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, cardVariants, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const TrainSeatSelection = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);

    if (!state || !state.item) {
        return <div className="text-center mt-20 text-2xl font-bold">Invalid Routing. Go back and select a train.</div>;
    }

    const { item, selectedClass } = state;
    const basePrice = selectedClass === '3A' ? 1200 : 450;
    const coachPrefix = selectedClass === '3A' ? 'B' : 'S';

    // Generate a coach layout (e.g. 72 berths)
    const [seats] = useState(() =>
        Array.from({ length: 40 }, (_, i) => {
            const num = i + 1;
            let berthType = 'Upper';
            if (num % 8 === 1 || num % 8 === 4) berthType = 'Lower';
            if (num % 8 === 2 || num % 8 === 5) berthType = 'Middle';
            if (num % 8 === 7) berthType = 'Side Lower';
            if (num % 8 === 0) berthType = 'Side Upper';

            return {
                id: `${coachPrefix}1-${num}`,
                type: berthType,
                status: Math.random() > 0.6 ? 'Occupied' : 'Available',
                price: basePrice
            };
        })
    );

    const handleSeatClick = (seat) => {
        if (seat.status === 'Occupied') return;
        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 6) {
                alert("Maximum 6 passengers allowed per ticket");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;

        const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
        navigate('/checkout', {
            state: {
                type: 'Train',
                item: { ...item, price: totalPrice },
                seats: selectedSeats.map(s => s.id)
            }
        });
    };

    const getSeatClass = (seat) => {
        if (seat.status === 'Occupied') return 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300';
        if (selectedSeats.find(s => s.id === seat.id)) return 'bg-emerald-500 text-white border-emerald-600 shadow-md transform scale-105';
        if (seat.type === 'Lower' || seat.type === 'Side Lower') return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300';
        return 'bg-white text-slate-700 hover:bg-emerald-50 border-slate-200';
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-4">

                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm tracking-widest uppercase mb-4 shadow-sm border border-emerald-200">
                        Select Berths
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{item.trainName}</h2>
                    <p className="text-lg text-slate-500 mt-2 font-medium">{item.fromStation} &rarr; {item.toStation} | Coach {coachPrefix}1 ({selectedClass})</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Seat Map Column */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="flex flex-wrap gap-6 justify-center">
                                {/* Simulated train bays (8 seats per bay normally, here simplified) */}
                                {Array.from({ length: 5 }).map((_, bayIndex) => (
                                    <div key={bayIndex} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-8 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            {seats.slice(bayIndex * 8, bayIndex * 8 + 6).map(seat => (
                                                <div key={seat.id} onClick={() => handleSeatClick(seat)}
                                                    className={`w-14 h-12 cursor-pointer rounded-md border-2 flex flex-col items-center justify-center font-bold text-xs transition-all ${getSeatClass(seat)}`}
                                                >
                                                    <span>{seat.id.split('-')[1]}</span>
                                                    <span className="text-[9px] opacity-70 uppercase truncate w-full text-center px-1">{seat.type.replace('Side ', 'S')}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-4 border-l-2 border-dashed border-slate-300"></div>
                                        <div className="flex flex-col justify-between gap-2">
                                            {seats.slice(bayIndex * 8 + 6, bayIndex * 8 + 8).map(seat => (
                                                <div key={seat.id} onClick={() => handleSeatClick(seat)}
                                                    className={`w-14 h-12 cursor-pointer rounded-md border-2 flex flex-col items-center justify-center font-bold text-xs transition-all ${getSeatClass(seat)}`}
                                                >
                                                    <span>{seat.id.split('-')[1]}</span>
                                                    <span className="text-[9px] opacity-70 uppercase truncate w-full text-center px-1">{seat.type.replace('Side ', 'S. ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 border-b pb-4">Booking Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Class</span>
                                    <span className="text-slate-900 font-bold">{selectedClass}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Base Fare (per pax)</span>
                                    <span className="text-slate-900 font-bold">₹{basePrice}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium border-t border-slate-100 pt-4">
                                    <span className="text-slate-500">Selected Berths</span>
                                    <span className="text-indigo-600 font-bold max-w-[150px] text-right truncate">
                                        {selectedSeats.length > 0 ? selectedSeats.map(s => s.id.split('-')[1]).join(', ') : 'None'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-4 mb-8 border border-emerald-100">
                                <div className="flex justify-between items-end">
                                    <span className="block text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</span>
                                    <span className="text-3xl font-black text-emerald-700">₹{selectedSeats.reduce((a, s) => a + s.price, 0)}</span>
                                </div>
                            </div>

                            <motion.button variants={btnVariants} whileHover="hover" whileTap="tap"
                                onClick={handleProceed}
                                disabled={selectedSeats.length === 0}
                                className={`w-full py-4 rounded-xl font-bold transition-colors shadow-md flex justify-center items-center ${selectedSeats.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                                Proceed to Checkout
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default TrainSeatSelection;
