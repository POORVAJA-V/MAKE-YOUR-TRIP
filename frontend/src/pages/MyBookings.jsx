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
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings');
            const apiBookings = res.data || [];
            const localBookings = JSON.parse(sessionStorage.getItem('localBookings') || '[]');
            const allBookings = [...apiBookings, ...localBookings];
            setBookings(allBookings);
        } catch (err) {
            const localBookings = JSON.parse(sessionStorage.getItem('localBookings') || '[]');
            setBookings(localBookings);
        }
        setLoading(false);
    };

    const getTripDetails = (b) => {
        const d = b.itemDetails || {};
        let title = '';
        let subtitle = '';
        let icon = '';

        if (b.bookingType === 'Flight') {
            title = d.airline ? d.airline + ' - ' + d.flightNumber : 'Flight Booking';
            subtitle = (d.departureCity || 'Origin') + ' → ' + (d.arrivalCity || 'Destination');
            icon = '✈️';
        } else if (b.bookingType === 'Bus') {
            title = d.operator || 'Bus Booking';
            subtitle = (d.routeFrom || 'Origin') + ' → ' + (d.routeTo || 'Destination');
            icon = '🚌';
        } else if (b.bookingType === 'Train') {
            title = d.trainName ? d.trainName + ' (' + d.trainNumber + ')' : 'Train Booking';
            subtitle = (d.fromStation || 'Origin') + ' → ' + (d.toStation || 'Destination');
            icon = '🚆';
        } else if (b.bookingType === 'Cab') {
            title = d.vehicleType ? d.vehicleType + ' Cab' : 'Cab Booking';
            subtitle = (d.pickupLocation || 'Pickup') + ' → ' + (d.dropoffLocation || 'Dropoff');
            icon = '🚕';
        } else if (b.bookingType === 'Hotel') {
            title = d.name || d.hotelName || 'Hotel Booking';
            subtitle = (d.city || d.hotelCity || '') + ', ' + (d.country || 'India');
            icon = '🏨';
        } else {
            title = b.bookingType + ' Booking';
            subtitle = 'Details unavailable';
            icon = '📋';
        }

        return { title, subtitle, icon };
    };

    const getQRUrl = (b) => {
        const { title, subtitle, icon } = getTripDetails(b);
        
        const ticketData = {
            id: (b._id || '').slice(-8).toUpperCase() || ('BK' + Date.now()).slice(-8).toUpperCase(),
            type: b.bookingType,
            title: title,
            route: subtitle,
            icon: icon,
            price: b.totalPrice,
            status: b.paymentStatus || 'Paid',
            date: b.createdAt || b.bookingDate,
            checkIn: b.itemDetails?.checkIn,
            checkOut: b.itemDetails?.checkOut,
            roomType: b.itemDetails?.roomType,
            guests: b.itemDetails?.guests,
            hotelAddress: b.itemDetails?.hotelAddress || b.itemDetails?.city,
            departureTime: b.itemDetails?.departureTime,
            arrivalTime: b.itemDetails?.arrivalTime,
            passengers: b.passengers || b.itemDetails?.passengers || []
        };
        
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(ticketData))));
        return window.location.origin + '/booking/ticket?data=' + encoded;
    };

    const downloadTicket = (booking) => {
        const { title, subtitle, icon } = getTripDetails(booking);
        const qrUrl = getQRUrl(booking);
        
        const isHotel = booking.bookingType === 'Hotel';
        
        let ticketContent = '';
        
        if (isHotel) {
            ticketContent = '<div class="detail-grid"><div class="detail-box"><div class="detail-label">Check-in</div><div class="detail-value">' + new Date(booking.itemDetails?.checkIn || Date.now()).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) + '</div></div><div class="detail-box"><div class="detail-label">Check-out</div><div class="detail-value">' + new Date(booking.itemDetails?.checkOut || Date.now() + 86400000).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) + '</div></div><div class="detail-box"><div class="detail-label">Room Type</div><div class="detail-value">' + (booking.itemDetails?.roomType || 'Standard Room') + '</div></div><div class="detail-box"><div class="detail-label">Guests</div><div class="detail-value">' + (booking.itemDetails?.guests || 2) + ' Guests</div></div></div><div class="detail-box"><div class="detail-label">Hotel Address</div><div class="detail-value">' + (booking.itemDetails?.hotelAddress || booking.itemDetails?.city || 'India') + '</div></div>';
        } else {
            ticketContent = '<div class="route"><div class="route-large">' + (booking.itemDetails?.departureCity || booking.itemDetails?.fromStation || 'Origin') + ' → ' + (booking.itemDetails?.arrivalCity || booking.itemDetails?.toStation || 'Destination') + '</div></div><div class="detail-grid"><div class="detail-box"><div class="detail-label">Departure</div><div class="detail-value">' + (booking.itemDetails?.departureTime ? new Date(booking.itemDetails.departureTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : '--:--') + '</div></div><div class="detail-box"><div class="detail-label">Arrival</div><div class="detail-value">' + (booking.itemDetails?.arrivalTime ? new Date(booking.itemDetails.arrivalTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : '--:--') + '</div></div><div class="detail-box"><div class="detail-label">Seats</div><div class="detail-value">' + ((booking.passengers || booking.itemDetails?.passengers || []).join(', ') || 'Standard') + '</div></div><div class="detail-box"><div class="detail-label">Booking ID</div><div class="detail-value">' + ((booking._id || '').slice(-8).toUpperCase()) + '</div></div></div><div class="qr-section"><img class="qr-code" src="' + qrUrl + '" alt="QR"/><div class="qr-label">Scan for E-Ticket</div></div>';
        }
        
        const ticketHtml = '<!DOCTYPE html><html><head><title>' + booking.bookingType + ' Ticket - ' + title + '</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:15px;background:#f5f5f5}.ticket{max-width:400px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.header{padding:20px;text-align:center;color:#fff}.header.hotel{background:linear-gradient(135deg,#3b82f6,#1d4ed8)}.header.flight{background:linear-gradient(135deg,#6366f1,#4f46e5)}.header.train{background:linear-gradient(135deg,#10b981,#059669)}.header.bus{background:linear-gradient(135deg,#f97316,#ea580c)}.header.cab{background:linear-gradient(135deg,#ec4899,#db2777)}.icon{font-size:36px;margin-bottom:8px}.header h1{font-size:18px;margin-bottom:4px}.header p{font-size:12px;opacity:.9}.body{padding:20px}.route{text-align:center;padding:15px;background:#f8fafc;border-radius:12px;margin-bottom:15px}.route-large{font-size:20px;font-weight:700;color:#1e293b}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px}.detail-box{background:#f8fafc;padding:12px;border-radius:10px}.detail-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}.detail-value{font-size:14px;font-weight:600;color:#1e293b}.qr-section{text-align:center;padding:20px;background:#f8fafc;border-radius:12px;margin-top:15px}.qr-code{width:120px;height:120px;margin:0 auto}.qr-label{font-size:10px;color:#94a3b8;margin-top:8px}.price-box{background:#ecfdf5;padding:15px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-top:15px}.price-label{font-size:12px;color:#059669}.price-value{font-size:24px;font-weight:700;color:#059669}.status{text-align:center;padding:10px;background:#059669;color:#fff;font-weight:700;font-size:14px;border-radius:8px;margin-top:15px}.footer{text-align:center;padding:15px;font-size:10px;color:#94a3b8}@media print{body{background:#fff;padding:0}.ticket{box-shadow:none}}</style></head><body><div class="ticket"><div class="header ' + (booking.bookingType || 'hotel').toLowerCase() + '"><div class="icon">' + icon + '</div><h1>' + title + '</h1><p>' + subtitle + '</p></div><div class="body">' + ticketContent + '<div class="price-box"><span class="price-label">Total Paid</span><span class="price-value">₹' + booking.totalPrice + '</span></div><div class="status">✓ CONFIRMED</div></div><div class="footer"><p>MakeYourTrip - Your Travel Partner</p><p>Booking Date: ' + new Date(booking.createdAt || booking.bookingDate || Date.now()).toLocaleDateString('en-IN') + '</p></div></div><script>window.print();</script></body></html>';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(ticketHtml);
        printWindow.document.close();
    };

    return (
        <PageWrapper className="pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-black mb-8 text-slate-900 tracking-tight">My Trips</h2>

                {loading ? (
                    <div className="text-center text-slate-500 py-5 font-bold">Loading your journeys...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center bg-slate-50 py-16 rounded-[2rem] border border-slate-100">
                        <div className="text-5xl mb-4">🧳</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No trips booked yet</h3>
                        <p className="text-slate-500">Your upcoming adventures will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {bookings.map(b => {
                            const { title, subtitle, icon } = getTripDetails(b);
                            return (
                                <motion.div
                                    key={b._id || Math.random()}
                                    variants={cardVariants}
                                    whileHover="hover"
                                    onClick={() => setSelectedBooking(b)}
                                    className="bg-white p-2 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center cursor-pointer shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="mb-4 sm:mb-0 flex items-start">
                                        <div className="text-4xl mr-4">{icon}</div>
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{b.bookingType}</span>
                                                <span className="text-sm font-bold text-slate-800">{title}</span>
                                            </div>
                                            <p className="text-slate-600 font-medium">{subtitle}</p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {b.bookingType === 'Hotel' 
                                                    ? 'Check-in: ' + new Date(b.itemDetails?.checkIn || Date.now()).toLocaleDateString() + ' | Check-out: ' + new Date(b.itemDetails?.checkOut || Date.now() + 86400000).toLocaleDateString()
                                                    : b.itemDetails?.departureTime 
                                                        ? new Date(b.itemDetails.departureTime).toLocaleString()
                                                        : 'Booked on ' + new Date(b.createdAt || b.bookingDate).toLocaleDateString()
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-end items-center sm:items-end">
                                        <span className="font-black text-2xl text-slate-900 block mb-1">₹{b.totalPrice}</span>
                                        <span className={'font-bold text-sm ' + (b.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500')}>
                                            {b.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Ticket Modal - Fixed Center Overlay */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
                        onClick={() => setSelectedBooking(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={'p-4 flex justify-between items-start ' + (
                                selectedBooking.bookingType === 'Hotel' ? 'bg-blue-600' :
                                selectedBooking.bookingType === 'Flight' ? 'bg-indigo-600' :
                                selectedBooking.bookingType === 'Train' ? 'bg-emerald-600' :
                                selectedBooking.bookingType === 'Bus' ? 'bg-orange-600' : 'bg-slate-600'
                            ) + ' text-white'}>
                                <div>
                                    <span className="bg-white/20 text-white px-2 py-0 rounded text-xs font-bold uppercase tracking-wider inline-block mb-2">
                                        {selectedBooking.bookingType} {selectedBooking.bookingType === 'Hotel' ? 'Booking' : 'E-Ticket'}
                                    </span>
                                    <h3 className="text-lg font-black">{getTripDetails(selectedBooking).title}</h3>
                                    <p className="text-white/80 text-sm">{getTripDetails(selectedBooking).subtitle}</p>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="text-white/60 hover:text-white text-2xl leading-none">&times;</button>
                            </div>

                            {/* Content */}
                            <div className="p-4 max-h-[70vh]">
                                {selectedBooking.bookingType === 'Hotel' ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Check-in</p>
                                                <p className="font-bold text-slate-800 text-sm">{new Date(selectedBooking.itemDetails?.checkIn || Date.now()).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Check-out</p>
                                                <p className="font-bold text-slate-800 text-sm">{new Date(selectedBooking.itemDetails?.checkOut || Date.now() + 86400000).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Room Type</p>
                                                <p className="font-bold text-slate-800 text-sm">{selectedBooking.itemDetails?.roomType || 'Standard Room'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Guests</p>
                                                <p className="font-bold text-slate-800 text-sm">{selectedBooking.itemDetails?.guests || 2}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
                                            <p className="font-bold text-slate-800 text-sm">{selectedBooking.itemDetails?.hotelAddress || selectedBooking.itemDetails?.city || 'India'}</p>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl">
                                            <div>
                                                <p className="text-xs font-bold text-emerald-600 uppercase">Total Paid</p>
                                                <p className="font-black text-xl text-emerald-700">₹{selectedBooking.totalPrice}</p>
                                            </div>
                                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs">PAID</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Depart</p>
                                                <p className="font-black text-slate-800">{selectedBooking.itemDetails?.departureTime ? new Date(selectedBooking.itemDetails.departureTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                                            </div>
                                            <div className="flex-1 mx-4"><div className="h-[2px] bg-slate-300 relative"><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-800"></div></div></div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Arrive</p>
                                                <p className="font-black text-slate-800">{selectedBooking.itemDetails?.arrivalTime ? new Date(selectedBooking.itemDetails.arrivalTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Seats</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(selectedBooking.passengers || selectedBooking.itemDetails?.passengers || []).length > 0 ? (
                                                    (selectedBooking.passengers || selectedBooking.itemDetails?.passengers || []).map((seat, i) => (
                                                        <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold text-xs">{seat}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-500 text-sm">Standard Booking</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">E-Ticket</p>
                                            <img src={'https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=' + encodeURIComponent(getQRUrl(selectedBooking))} alt="QR Code" className="w-24 h-24" />
                                            <p className="text-xs font-bold text-slate-400 mt-2">Booking: {(selectedBooking._id || '').slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl">
                                            <div>
                                                <p className="text-xs font-bold text-emerald-600 uppercase">Total Paid</p>
                                                <p className="font-black text-xl text-emerald-700">₹{selectedBooking.totalPrice}</p>
                                            </div>
                                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs">PAID</span>
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => downloadTicket(selectedBooking)} className="w-full mt-4 bg-slate-900 text-white hover:bg-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                                    <span>📥</span> Download Ticket
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};
export default MyBookings;

