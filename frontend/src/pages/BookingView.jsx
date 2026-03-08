import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const InfoRow = ({ label, value }) =>
    value ? (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-slate-100 last:border-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-0">{label}</span>
            <span className="font-semibold text-slate-800 sm:text-right max-w-xs">{value}</span>
        </div>
    ) : null;

const typeIcon = (type) => {
    const icons = { Hotel: '🏨', Flight: '✈️', Bus: '🚌', Train: '🚂', Cab: '🚕' };
    return icons[type] || '🧳';
};

const BookingView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Priority 1: Try reading self-contained data from the URL param (works without network)
        const raw = searchParams.get('data');
        if (raw) {
            try {
                const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
                setBooking(parsed);
                setLoading(false);
                return;
            } catch {
                // fall through to API call
            }
        }

        // Priority 2: Fetch from the public backend endpoint
        axios
            .get(`${API_URL}/bookings/public/${id}`)
            .then((res) => { setBooking(res.data); setLoading(false); })
            .catch(() => { setError('Booking not found or invalid QR code.'); setLoading(false); });
    }, [id, searchParams]);

    const getDetails = (b) => {
        if (!b) return {};
        const d = b.itemDetails || {};
        switch (b.bookingType) {
            case 'Flight':
                return {
                    title: `${d.airline || ''} ${d.flightNumber || ''}`.trim() || 'Flight',
                    route: `${d.departureCity || '—'} → ${d.arrivalCity || '—'}`,
                    extra: [
                        { label: 'Airline', value: d.airline },
                        { label: 'Flight No.', value: d.flightNumber },
                        { label: 'Duration', value: d.duration },
                        { label: 'Baggage', value: d.baggage },
                        { label: 'Departure', value: d.departureTime ? new Date(d.departureTime).toLocaleString() : null },
                        { label: 'Arrival', value: d.arrivalTime ? new Date(d.arrivalTime).toLocaleString() : null },
                    ],
                };
            case 'Hotel':
                return {
                    title: d.name || 'Hotel',
                    route: `${d.city || ''}, ${d.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
                    extra: [
                        { label: 'Hotel', value: d.name },
                        { label: 'City', value: d.city },
                        { label: 'Country', value: d.country },
                        { label: 'Star Rating', value: d.star ? '★'.repeat(d.star) : null },
                        { label: 'Amenities', value: d.amenities?.join(', ') },
                    ],
                };
            case 'Bus':
                return {
                    title: d.operator || 'Bus',
                    route: `${d.routeFrom || '—'} → ${d.routeTo || '—'}`,
                    extra: [
                        { label: 'Operator', value: d.operator },
                        { label: 'Bus No.', value: d.busNumber },
                        { label: 'Departure', value: d.departureTime ? new Date(d.departureTime).toLocaleString() : null },
                        { label: 'Arrival', value: d.arrivalTime ? new Date(d.arrivalTime).toLocaleString() : null },
                    ],
                };
            case 'Train':
                return {
                    title: `${d.trainName || ''} ${d.trainNumber ? `(${d.trainNumber})` : ''}`.trim() || 'Train',
                    route: `${d.fromStation || '—'} → ${d.toStation || '—'}`,
                    extra: [
                        { label: 'Train', value: d.trainName },
                        { label: 'Train No.', value: d.trainNumber },
                        { label: 'Departure', value: d.departureTime ? new Date(d.departureTime).toLocaleString() : null },
                        { label: 'Arrival', value: d.arrivalTime ? new Date(d.arrivalTime).toLocaleString() : null },
                    ],
                };
            case 'Cab':
                return {
                    title: `${d.vehicleType || 'Cab'} Cab`,
                    route: `${d.pickupLocation || '—'} → ${d.dropoffLocation || '—'}`,
                    extra: [
                        { label: 'Vehicle', value: d.vehicleType },
                        { label: 'Driver', value: d.driverName },
                        { label: 'Capacity', value: d.capacity ? `${d.capacity} seats` : null },
                    ],
                };
            default:
                return { title: b.bookingType + ' Booking', route: 'Details unavailable', extra: [] };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="font-semibold text-slate-300">Loading ticket…</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Invalid Ticket</h2>
                    <p className="text-slate-500 mb-6">{error || 'This QR code is not valid.'}</p>
                    <Link to="/" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl inline-block hover:bg-indigo-700 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const { title, route, extra } = getDetails(booking);
    const icon = typeIcon(booking.bookingType);
    const bookedDate = new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const bookingRef = booking._id?.slice(-8).toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">{icon}</span>
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {booking.bookingType} E-Ticket
                            </span>
                        </div>
                        <h1 className="text-2xl font-black leading-tight mb-1">{title}</h1>
                        <p className="text-blue-100 font-medium text-sm">{route}</p>
                    </div>
                </div>

                {/* Tear line */}
                <div className="bg-white flex items-center">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 -ml-2.5 flex-shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 -mr-2.5 flex-shrink-0" />
                </div>

                {/* Ticket Body */}
                <div className="bg-white rounded-b-3xl shadow-2xl overflow-hidden">
                    {/* Booking Ref + Status */}
                    <div className="px-6 pt-5 pb-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Ref</p>
                            <p className="font-black text-slate-800 text-lg tracking-widest">MYT-{bookingRef}</p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${booking.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                            {booking.paymentStatus === 'Paid' ? '✓ Confirmed' : '⚠ Pending'}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="px-6 py-2">
                        {extra.map(({ label, value }) => (
                            <InfoRow key={label} label={label} value={value} />
                        ))}
                        {booking.passengers?.length > 0 && (
                            <InfoRow label="Seats / Passengers" value={booking.passengers.join(', ')} />
                        )}
                        <InfoRow label="Booked On" value={bookedDate} />
                    </div>

                    {/* Amount */}
                    <div className="mx-6 mb-6 mt-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 flex justify-between items-center border border-indigo-100">
                        <span className="text-slate-600 font-semibold">Total Paid</span>
                        <span className="text-2xl font-black text-indigo-700">₹{booking.totalPrice}</span>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold">🌐 MakeYourTrip</span>
                        <Link to="/" className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors">
                            Book Another Trip →
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingView;
