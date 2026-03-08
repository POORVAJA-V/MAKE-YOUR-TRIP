import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const typeIcon = (type) => ({ Hotel: '🏨', Flight: '✈️', Bus: '🚌', Train: '🚂', Cab: '🚕' }[type] || '🧳');

const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200 last:border-0">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="font-semibold text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
) : null;

const BookingView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const raw = searchParams.get('data');
        if (raw) {
            try {
                setBooking(JSON.parse(decodeURIComponent(escape(atob(raw)))));
                return;
            } catch { /* fall through */ }
        }
        // Fallback: try public API
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/bookings/public/${id}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setBooking({
                id: (data._id || '').slice(-8).toUpperCase(),
                _id: data._id,
                type: data.bookingType,
                title: data.itemDetails?.name || data.itemDetails?.airline || data.bookingType,
                route: data.itemDetails?.city || `${data.itemDetails?.departureCity || ''} → ${data.itemDetails?.arrivalCity || ''}`,
                price: data.totalPrice,
                status: data.paymentStatus,
                date: data.createdAt,
                dep: data.itemDetails?.departureTime,
                arr: data.itemDetails?.arrivalTime,
                passengers: data.passengers || [],
            }))
            .catch(() => setError('Invalid or expired ticket.'));
    }, [id, searchParams]);

    const handleDownload = () => window.print();

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Invalid Ticket</h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <Link to="/" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl inline-block">Go Home</Link>
            </div>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
    );

    const icon = typeIcon(booking.type);
    const ref = `MYT-${booking.id || (booking._id || '').slice(-8).toUpperCase()}`;
    const bookedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
    const depStr = booking.dep ? new Date(booking.dep).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
    const arrStr = booking.arr ? new Date(booking.arr).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
    const isConfirmed = booking.status === 'Paid';

    return (
        <>
            {/* ── Print / PDF Styles ─────────────────────────── */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .ticket-wrapper { box-shadow: none !important; max-width: 100% !important; }
                    @page { margin: 10mm; size: A5 portrait; }
                }
            `}</style>

            {/* ── Screen background ──────────────────────────── */}
            <div className="no-print min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 py-12 gap-6">

                {/* Download button */}
                <motion.button
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-white text-slate-900 font-black px-6 py-3 rounded-2xl shadow-xl text-base hover:bg-indigo-600 hover:text-white transition-all"
                >
                    <span className="text-xl">⬇️</span> Download Ticket PDF
                </motion.button>

                <p className="text-white/50 text-xs font-medium no-print">Tap the button above — your browser will save it as a PDF</p>
            </div>

            {/* ── Ticket — visible on screen AND in print ──── */}
            <div className="ticket-wrapper w-full max-w-md mx-auto px-4 pb-12 -mt-56 relative z-10 no-print-offset">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-700 to-blue-500 p-6 text-white relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="relative z-10 flex items-center gap-3 mb-4">
                            <span className="text-4xl">{icon}</span>
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                {booking.type} E-Ticket
                            </span>
                        </div>
                        <h1 className="text-2xl font-black relative z-10 leading-tight">{booking.title}</h1>
                        <p className="text-blue-100 text-sm font-medium mt-1 relative z-10">{booking.route}</p>
                    </div>

                    {/* Tear line */}
                    <div className="flex items-center bg-white">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-700 to-blue-500 -ml-2.5 flex-shrink-0" />
                        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-700 to-blue-500 -mr-2.5 flex-shrink-0" />
                    </div>

                    {/* Body */}
                    <div className="bg-white px-6 pt-4 pb-2">
                        {/* Ref + Status */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking Ref</p>
                                <p className="font-black text-xl text-slate-800 tracking-widest">{ref}</p>
                            </div>
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {isConfirmed ? '✓ Confirmed' : '⚠ Pending'}
                            </span>
                        </div>

                        {/* Details rows */}
                        <Row label="Departure" value={depStr} />
                        <Row label="Arrival" value={arrStr} />
                        {booking.passengers?.length > 0 && (
                            <Row label="Seats" value={booking.passengers.join(', ')} />
                        )}
                        <Row label="Booked On" value={bookedDate} />

                        {/* Amount */}
                        <div className="mt-4 mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 flex justify-between items-center border border-indigo-100">
                            <span className="text-slate-600 font-semibold">Total Paid</span>
                            <span className="text-2xl font-black text-indigo-700">₹{booking.price}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                        <div>
                            <p className="text-white font-black text-sm">🌐 MakeYourTrip</p>
                            <p className="text-slate-400 text-xs mt-0.5">Your Journey, Our Passion</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs">Powered by</p>
                            <p className="text-blue-400 text-xs font-bold">makeyourtrip.app</p>
                        </div>
                    </div>
                </motion.div>

                {/* Extra download button below ticket on screen */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    onClick={handleDownload}
                    className="no-print w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-base shadow-xl transition-colors flex items-center justify-center gap-2"
                >
                    <span>⬇️</span> Save as PDF
                </motion.button>

                <p className="no-print text-center text-white/40 text-xs mt-3">
                    iPhone: tap Share → Print → Pinch to zoom → Save PDF<br />
                    Android: tap Download → Save as PDF
                </p>
            </div>

            {/* ── Print-only version (full page, no bg) ──────── */}
            <div className="hidden print:block p-8 max-w-lg mx-auto">
                <div className="border-2 border-indigo-600 rounded-2xl overflow-hidden">
                    <div className="bg-indigo-700 p-5 text-white">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{icon}</span>
                            <span className="text-xs font-bold border border-white/40 px-2 py-1 rounded uppercase tracking-wider">{booking.type} E-Ticket</span>
                        </div>
                        <h1 className="text-2xl font-black">{booking.title}</h1>
                        <p className="text-indigo-200 text-sm mt-1">{booking.route}</p>
                    </div>
                    <div className="border-t-2 border-dashed border-indigo-300" />
                    <div className="p-5">
                        <div className="flex justify-between mb-4">
                            <div><p className="text-xs text-gray-500 uppercase font-bold">Booking Ref</p><p className="text-xl font-black tracking-widest">{ref}</p></div>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full h-fit ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {isConfirmed ? '✓ Confirmed' : '⚠ Pending'}
                            </span>
                        </div>
                        {depStr && <div className="flex justify-between py-2 border-b border-dashed border-gray-200"><span className="text-xs font-bold text-gray-400 uppercase">Departure</span><span className="font-semibold text-sm">{depStr}</span></div>}
                        {arrStr && <div className="flex justify-between py-2 border-b border-dashed border-gray-200"><span className="text-xs font-bold text-gray-400 uppercase">Arrival</span><span className="font-semibold text-sm">{arrStr}</span></div>}
                        {booking.passengers?.length > 0 && <div className="flex justify-between py-2 border-b border-dashed border-gray-200"><span className="text-xs font-bold text-gray-400 uppercase">Seats</span><span className="font-semibold">{booking.passengers.join(', ')}</span></div>}
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200"><span className="text-xs font-bold text-gray-400 uppercase">Booked On</span><span className="font-semibold">{bookedDate}</span></div>
                        <div className="mt-4 bg-indigo-50 rounded-xl p-3 flex justify-between items-center border border-indigo-100">
                            <span className="font-semibold text-gray-600">Total Paid</span>
                            <span className="text-2xl font-black text-indigo-700">₹{booking.price}</span>
                        </div>
                    </div>
                    <div className="bg-gray-900 px-5 py-3 flex justify-between items-center">
                        <span className="text-white font-bold text-sm">🌐 MakeYourTrip</span>
                        <span className="text-gray-400 text-xs">Your Journey, Our Passion</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingView;
