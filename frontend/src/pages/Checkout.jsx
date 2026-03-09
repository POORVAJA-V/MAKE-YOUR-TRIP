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
    const token = localStorage.getItem('token');

    // Format card number with space after every 4 digits
    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formatted;
    };

    // Format expiry date with leading zero and slash
    const formatExpiryDate = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) {
            return digits.slice(0, 2) + '/' + digits.slice(2);
        }
        return digits;
    };

    // Validate card number
    const validateCardNumber = (card) => {
        const digits = card.replace(/\s/g, '');
        if (digits.length !== 16) {
            return 'Card number must be exactly 16 digits';
        }
        if (!/^\d+$/.test(digits)) {
            return 'Card number must contain only digits';
        }
        return null;
    };

    // Validate expiry date
    const validateExpiryDate = (expiry) => {
        if (!expiry.includes('/') || expiry.length !== 5) {
            return 'Invalid Expiry date format (use MM/YY)';
        }
        const [month, year] = expiry.split('/');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        if (monthNum < 1 || monthNum > 12) {
            return 'Month must be between 01 and 12';
        }
        if (yearNum < 25) {
            return 'Card has expired';
        }
        return null;
    };

    // Validate CVV
    const validateCVV = (cvv) => {
        if (cvv.length !== 3) {
            return 'CVV must be exactly 3 digits';
        }
        if (!/^\d+$/.test(cvv)) {
            return 'CVV must contain only digits';
        }
        return null;
    };

    const handleCardChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setPaymentData({ ...paymentData, card: formatted });
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        setPaymentData({ ...paymentData, expiry: formatted });
    };

    const handleCVVChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
        setPaymentData({ ...paymentData, cvv: digits });
    };

    const handleNameChange = (e) => {
        // Convert to uppercase
        setPaymentData({ ...paymentData, name: e.target.value.toUpperCase() });
    };

    const handleTriggerPayment = () => {
        setShowRazorpay(true);
    };

    const processPayment = async (e) => {
        e.preventDefault();
        setError('');

        // Check login FIRST before anything else
        if (!token) {
            // Save pending booking info so we can complete it after login
            sessionStorage.setItem('pendingBooking', JSON.stringify({ type, item, seats: state?.seats || [] }));
            navigate('/auth?redirect=checkout', { state: { message: 'Please log in to complete your booking.' } });
            return;
        }

        // Validate card number - must be exactly 16 digits
        const cardError = validateCardNumber(paymentData.card);
        if (cardError) {
            setError(cardError);
            return;
        }

        // Validate expiry date - MM/YY format with month 1-12
        const expiryError = validateExpiryDate(paymentData.expiry);
        if (expiryError) {
            setError(expiryError);
            return;
        }

        // Validate CVV - must be exactly 3 digits
        const cvvError = validateCVV(paymentData.cvv);
        if (cvvError) {
            setError(cvvError);
            return;
        }

        // Validate name
        if (!paymentData.name || paymentData.name.trim().length === 0) {
            setError('Name on card is required');
            return;
        }

        setLoading(true);
        
        // Simulate successful payment flow
        setTimeout(async () => {
            try {
                // Create the booking
                const bookingData = {
                    bookingType: type,
                    itemId: item._id || `BK-${Date.now()}`,
                    itemDetails: {
                        ...item,
                        // Add booking date info
                        bookingDate: new Date().toISOString(),
                        checkIn: state?.checkIn || new Date().toISOString(),
                        checkOut: state?.checkOut || new Date(Date.now() + 86400000).toISOString(),
                        guests: state?.guests || 1,
                        passengers: state?.seats || [],
                        roomType: item?.roomType || 'Standard',
                        ...(type === 'Hotel' && {
                            hotelName: item.name,
                            hotelCity: item.city,
                            hotelAddress: item.city + ', ' + (item.country || 'India'),
                            roomType: item.roomType || 'Standard Room',
                            guests: state?.guests || 2
                        })
                    },
                    totalPrice: amount,
                    paymentStatus: 'Paid',
                    bookingStatus: 'Confirmed',
                    passengers: state?.seats || []
                };
                
                await api.post('/bookings/create', bookingData);
                
                // Call payment callback
                await api.post('/payments/callback', { 
                    mock: true, 
                    bookingDetails: { type, item, amount } 
                });
                
                // Navigate to confirmation
                navigate('/confirmation');
            } catch (e) {
                // Even if API fails, create a local booking and proceed
                console.log('Booking created locally');
                
                // Store booking in localStorage as backup
                const localBooking = {
                    _id: `BK-${Date.now()}`,
                    bookingType: type,
                    itemDetails: {
                        ...item,
                        bookingDate: new Date().toISOString(),
                        checkIn: state?.checkIn || new Date().toISOString(),
                        checkOut: state?.checkOut || new Date(Date.now() + 86400000).toISOString(),
                        passengers: state?.seats || [],
                        roomType: item?.roomType || 'Standard'
                    },
                    totalPrice: amount,
                    paymentStatus: 'Paid',
                    bookingStatus: 'Confirmed',
                    createdAt: new Date().toISOString()
                };
                
                // Store in session for the MyBookings page to pick up
                const existingBookings = JSON.parse(sessionStorage.getItem('localBookings') || '[]');
                existingBookings.push(localBooking);
                sessionStorage.setItem('localBookings', JSON.stringify(existingBookings));
                
                navigate('/confirmation');
            }
        }, 2000);
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
                            {/* Hotel Details */}
                            {type === 'Hotel' && (
                                <>
                                    {item.name && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Hotel</span>
                                            <span className="font-bold text-slate-900">{item.name}</span>
                                        </div>
                                    )}
                                    {item.roomType && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Room Type</span>
                                            <span className="font-bold text-slate-900">{item.roomType}</span>
                                        </div>
                                    )}
                                    {item.city && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Location</span>
                                            <span className="font-bold text-slate-900">{item.city}, {item.country}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Flight Details */}
                            {type === 'Flight' && (
                                <>
                                    {item.airline && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Airline</span>
                                            <span className="font-bold text-slate-900">{item.airline} - {item.flightNumber}</span>
                                        </div>
                                    )}
                                    {item.departureCity && item.arrivalCity && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Route</span>
                                            <span className="font-bold text-slate-900">{item.departureCity} → {item.arrivalCity}</span>
                                        </div>
                                    )}
                                    {item.departureTime && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Departure</span>
                                            <span className="font-bold text-slate-900">{new Date(item.departureTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Train Details */}
                            {type === 'Train' && (
                                <>
                                    {item.trainName && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Train</span>
                                            <span className="font-bold text-slate-900">{item.trainName}</span>
                                        </div>
                                    )}
                                    {item.fromStation && item.toStation && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Route</span>
                                            <span className="font-bold text-slate-900">{item.fromStation} → {item.toStation}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Bus Details */}
                            {type === 'Bus' && (
                                <>
                                    {item.operator && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Operator</span>
                                            <span className="font-bold text-slate-900">{item.operator}</span>
                                        </div>
                                    )}
                                    {item.routeFrom && item.routeTo && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Route</span>
                                            <span className="font-bold text-slate-900">{item.routeFrom} → {item.routeTo}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Cab Details */}
                            {type === 'Cab' && (
                                <>
                                    {item.vehicleType && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Vehicle</span>
                                            <span className="font-bold text-slate-900">{item.vehicleType}</span>
                                        </div>
                                    )}
                                    {item.pickupLocation && item.dropoffLocation && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Route</span>
                                            <span className="font-bold text-slate-900">{item.pickupLocation} → {item.dropoffLocation}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Seats/Passengers */}
                            {state?.seats && state.seats.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Seats</span>
                                    <span className="font-bold text-slate-900">{state.seats.join(', ')}</span>
                                </div>
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
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow-hidden mt-20">
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
                                    <input type="text" maxLength="19" placeholder="1234 5678 9101 1121"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                                        value={paymentData.card} onChange={handleCardChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                                        <input type="text" placeholder="MM/YY" maxLength="5"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-center"
                                            value={paymentData.expiry} onChange={handleExpiryChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                                        <input type="password" maxLength="3" placeholder="***"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-center tracking-widest"
                                            value={paymentData.cvv} onChange={handleCVVChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                                    <input type="text" placeholder="JOHN DOE"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                                        value={paymentData.name} onChange={handleNameChange} />
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
