import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/bookings')
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getTripDetails = (b) => {
        const d = b.itemDetails || {};
        let title = '';
        let destination = '';

        if (b.bookingType === 'Flight') {
            title = d.airline ? `${d.airline} - ${d.flightNumber}` : 'Flight Booking';
            destination = `${d.departureCity || 'Origin'} -> ${d.arrivalCity || 'Destination'}`;
        } else if (b.bookingType === 'Bus') {
            title = d.operator || 'Bus Booking';
            destination = `${d.routeFrom || 'Origin'} -> ${d.routeTo || 'Destination'}`;
        } else if (b.bookingType === 'Train') {
            title = d.trainName ? `${d.trainName} (${d.trainNumber})` : 'Train Booking';
            destination = `${d.fromStation || 'Origin'} -> ${d.toStation || 'Destination'}`;
        } else if (b.bookingType === 'Cab') {
            title = d.vehicleType ? `${d.vehicleType} Cab` : 'Cab Booking';
            destination = `${d.pickupLocation || 'Pickup'} -> ${d.dropoffLocation || 'Dropoff'}`;
        } else if (b.bookingType === 'Hotel') {
            title = d.name || 'Hotel Booking';
            destination = `${d.city || ''}, ${d.country || ''}`;
        } else {
            title = b.bookingType + ' Booking';
            destination = 'Details unavailable';
        }

        return { title, destination };
    };

    // Generates a scannable URL pointing to the BookingView page with slim booking data embedded
    const getQRUrl = (b) => {
        const { title, destination } = getTripDetails(b);
        const slim = {
            id: (b._id || '').slice(-8).toUpperCase(),
            _id: b._id,
            type: b.bookingType,
            title,
            route: destination,
            price: b.totalPrice,
            status: b.paymentStatus,
            date: b.createdAt,
            dep: b.itemDetails?.departureTime || null,
            arr: b.itemDetails?.arrivalTime || null,
            passengers: b.passengers || [],
        };
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
        return `${window.location.origin}/booking/${b._id || 'ticket'}?data=${encoded}`;
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-black mb-8 text-slate-900 tracking-tight">My Trips</h2>

                {loading ? (
                    <div className="text-center text-slate-500 py-10 font-bold">Loading your journeys...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center bg-slate-50 py-16 rounded-[2rem] border border-slate-100">
                        <div className="text-5xl mb-4">🧳</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No trips booked yet</h3>
                        <p className="text-slate-500">Your upcoming adventures will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(b => {
                            const { title, destination } = getTripDetails(b);
                            return (
                                <motion.div
                                    key={b._id}
                                    variants={cardVariants}
                                    whileHover="hover"
                                    onClick={() => setSelectedBooking(b)}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center cursor-pointer shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="mb-4 sm:mb-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{b.bookingType}</span>
                                            <span className="text-sm font-bold text-slate-800">{title}</span>
                                        </div>
                                        <p className="text-slate-600 font-medium">{destination}</p>
                                        <p className="text-xs text-slate-400 mt-2">Booked on {new Date(b.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <span className="font-black text-2xl text-slate-900 block mb-1">Rs.{b.totalPrice}</span>
                                        <span className={`font-bold text-sm ${b.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {b.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detailed Booking Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedBooking(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-6 flex justify-between items-start text-white">
                                <div>
                                    <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md inline-block mb-3">
                                        {selectedBooking.bookingType} E-Ticket
                                    </span>
                                    <h3 className="text-2xl font-black">{getTripDetails(selectedBooking).title}</h3>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="text-white/60 hover:text-white text-3xl leading-none">&times;</button>
                            </div>

                            <div className="p-8">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-8">
                                    <div className="flex-1 space-y-4 w-full">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination / Route</p>
                                            <p className="font-medium text-slate-800">{getTripDetails(selectedBooking).destination}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date &amp; Time</p>
                                            <p className="font-medium text-slate-800">
                                                {selectedBooking.itemDetails?.departureTime
                                                    ? new Date(selectedBooking.itemDetails.departureTime).toLocaleString()
                                                    : 'Anytime / As scheduled'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seats / Passengers</p>
                                            <p className="font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded mt-1">
                                                {selectedBooking.passengers && selectedBooking.passengers.length > 0
                                                    ? `Seats: ${selectedBooking.passengers.join(', ')}`
                                                    : 'Standard Booking Allocation'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Details</p>
                                            <p className="font-medium text-slate-800">Total: Rs.{selectedBooking.totalPrice} ({selectedBooking.paymentStatus})</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center flex-shrink-0">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(getQRUrl(selectedBooking))}`}
                                            alt="Booking QR Code"
                                            className="w-36 h-36"
                                        />
                                        <span className="text-xs font-bold text-slate-400 mt-3 tracking-widest uppercase">Scan to Download Ticket</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};
export default MyBookings;
