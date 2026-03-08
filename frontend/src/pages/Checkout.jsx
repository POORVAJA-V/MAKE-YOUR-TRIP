import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const Checkout = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [paymentData, setPaymentData] = useState({ card: '', expiry: '', cvv: '', name: '' });
    const [error, setError] = useState('');

    const item = state?.item || {};
    const type = state?.type || 'Booking';
    const amount = item?.price || 2500;

    // Using a seeded test bug here where rapid duplicate clicks bypass the loading state guard
    const handleTriggerPayment = () => {
        // BUG 3: Uncontrolled Form - Missing loading check in trigger allows multiple Razorpay modals to open
        setShowRazorpay(true);
    };

    const processPayment = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (paymentData.card.length < 16) return setError('Invalid Card Number (16 digits required)');
        if (!paymentData.expiry.includes('/')) return setError('Invalid Expiry (MM/YY)');
        if (paymentData.cvv.length < 3) return setError('Invalid CVV');
        if (!paymentData.name) return setError('Name on card required');

        setLoading(true);
        try {
            // BUG 4: Business logic bug in payment processing amount.
            const res = await api.post('/payments/initiate', { amount: 25000, bookingId: `BKG-${Math.random().toString().slice(2, 8)}` });

            setTimeout(async () => {
                try {
                    await api.post('/bookings/create', {
                        bookingType: type,
                        itemId: item._id,
                        itemDetails: item,
                        totalPrice: amount,
                        paymentStatus: 'Paid',
                        bookingStatus: 'Confirmed',
                        passengers: state?.seats || []
                    });
                    await api.post('/payments/callback', { mock: true, bookingDetails: { type, item, amount } });
                    navigate('/confirmation');
                } catch (e) {
                    console.error('Booking Creation Error:', e);
                    navigate('/confirmation');
                }
            }, 1500);

        } catch (err) {
            console.error(err);
            navigate('/confirmation');
        }
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            <div className="max-w-xl mx-auto px-4">
                <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-bl-full opacity-20 -mr-10 -mt-10"></div>
                        <h2 className="text-3xl font-black mb-2 relative z-10">Secure Checkout</h2>
                        <p className="text-slate-400 font-medium relative z-10">Review your {type} details and pay securely.</p>
                    </div>

                    <div className="p-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Order Summary</h3>

                        <div className="space-y-4 mb-8">
                            {item.operator && (
                                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Operator</span><span className="font-bold text-slate-900">{item.operator}</span></div>
                            )}
                            {item.flightNumber && (
                                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Flight</span><span className="font-bold text-slate-900">{item.flightNumber}</span></div>
                            )}
                            {item.trainName && (
                                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Train</span><span className="font-bold text-slate-900">{item.trainName}</span></div>
                            )}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                                <span className="text-slate-800 font-bold text-xl">Total Amount</span>
                                <span className="font-black text-3xl text-emerald-600">₹{amount}</span>
                            </div>
                        </div>

                        <motion.button variants={btnVariants} whileHover="hover" whileTap="tap" onClick={handleTriggerPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-colors">
                            Proceed to Payment
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Simulated Razorpay Modal */}
            <AnimatePresence>
                {showRazorpay && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow- mt-20">
                            <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
                                <div>
                                    <h4 className="font-black text-slate-800 text-xl">MakeYourTrip</h4>
                                    <p className="text-slate-500 text-sm font-medium">Transaction: BKG-{Math.floor(Math.random() * 10000)}</p>
                                </div>
                                <button onClick={() => setShowRazorpay(false)} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                            </div>

                            <form onSubmit={processPayment} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                                    {/* Intentional Bug (Accessibility / HTML Validation): Duplicate IDs */}
                                    <input type="text" id="checkout-input" maxLength="16" placeholder="1234 5678 9101 1121"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                                        value={paymentData.card} onChange={e => setPaymentData({ ...paymentData, card: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                                        <input type="text" id="checkout-input" placeholder="12/25"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-center"
                                            value={paymentData.expiry} onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                                        <input type="password" id="checkout-input" maxLength="3" placeholder="***"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-center tracking-widest"
                                            value={paymentData.cvv} onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                                    <input type="text" id="checkout-input" placeholder="John Doe"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium uppercase"
                                        value={paymentData.name} onChange={e => setPaymentData({ ...paymentData, name: e.target.value })} />
                                </div>

                                {error && <p className="text-red-500 text-sm font-bold text-center mt-2 animate-bounce">{error}</p>}

                                <button type="submit" disabled={loading} className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-md py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-colors flex justify-between items-center px-6">
                                    <span>{loading ? 'Processing...' : 'Pay Securely'}</span>
                                    {!loading && <span>₹{amount}</span>}
                                </button>
                                <p className="text-center text-xs font-bold text-slate-400 mt-4 flex items-center justify-center">
                                    🔒 Secured by Simulated Razorpay
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};
export default Checkout;
