
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
                <h2 className="text-2xl font-black text-slate-800 mb-2"> Invalid Ticket</h2>
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

    const qrData = encodeURIComponent(JSON.stringify({
        id: booking.id || booking._id?.slice(-8).toUpperCase(),
        type: booking.type,
        title: booking.title,
        route: booking.route,
        price: booking.price,
        status: booking.status,
        date: booking.date,
        dep: booking.dep,
        arr: booking.arr,
        passengers: booking.passengers
    }));
    const qrUrl = `${window.location.origin}/booking/${booking._id || 'ticket'}?data=${qrData}`;

    return (
        <>
            <style>{`
                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                    nav, header, footer, .no-print, .ticket-wrapper { display: none !important; }
                    .print-ticket-container { display: block !important; width: 100%; height: 100%; box-sizing: border-box; }
                }
            `}</style>

            <div className="no-print min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 py-12 gap-6">
                <motion.button
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-white text-slate-900 font-black px-6 py-3 rounded-2xl shadow-xl text-base hover:bg-indigo-600 hover:text-white transition-all"
                >
                    <span className="text-xl">⬇️</span> Download Ticket PDF
                </motion.button>
                <p className="text-white/50 text-xs font-medium no-print">Tap the button above — your browser will save it as a PDF</p>
            </div>

            <div className="ticket-wrapper w-full max-w-md mx-auto px-4 pb-12 -mt-56 relative z-10 no-print-offset">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
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

                    <div className="flex items-center bg-white">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-700 to-blue-500 -ml-2.5 flex-shrink-0" />
                        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-700 to-blue-500 -mr-2.5 flex-shrink-0" />
                    </div>

                    <div className="bg-white px-6 pt-4 pb-2">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking Ref</p>
                                <p className="font-black text-xl text-slate-800 tracking-widest">{ref}</p>
                            </div>
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {isConfirmed ? '✓ Confirmed' : '⚠ Pending'}
                            </span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex flex-col items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Scan for Digital Ticket</p>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=2&data=${encodeURIComponent(qrUrl)}`}
                                alt="Ticket QR Code"
                                className="w-36 h-36 rounded-lg"
                            />
                            <p className="text-xs text-slate-400 mt-2 text-center">Scan this QR code to view<br/>your ticket on another device</p>
                        </div>

                        <Row label="Departure" value={depStr} />
                        <Row label="Arrival" value={arrStr} />
                        {booking.passengers?.length > 0 && (
                            <Row label="Seats" value={booking.passengers.join(', ')} />
                        )}
                        <Row label="Booked On" value={bookedDate} />

                        <div className="mt-4 mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 flex justify-between items-center border border-indigo-100">
                            <span className="text-slate-600 font-semibold">Total Paid</span>
                            <span className="text-2xl font-black text-indigo-700">₹{booking.price}</span>
                        </div>
                    </div>

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

            <div className="hidden Print-ticket-container">
                <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #4f46e5', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', color: '#1e1b4b', fontWeight: '900', margin: 0 }}>MakeYourTrip</h1>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>Your Journey, Our Passion</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '24px', color: '#4f46e5', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>{booking.type} E-TICKET</h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0', fontWeight: 'bold' }}>{isConfirmed ? 'CONFIRMED' : 'PENDING'}</p>
                        </div>
                    </div>

                    <div style={{ border: '2px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', marginBottom: '30px' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderBottom: '2px solid #e5e7eb' }}>
                            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', fontWeight: 'bold' }}>Booking Reference</p>
                            <h3 style={{ fontSize: '24px', color: '#111827', margin: 0, fontWeight: '900', letterSpacing: '2px' }}>{ref}</h3>
                        </div>

                        <div style={{ padding: '30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '32px', marginRight: '15px' }}>{icon}</span>
                                    <div>
                                        <h2 style={{ fontSize: '22px', margin: 0, color: '#1f2937', fontWeight: '900' }}>{booking.title}</h2>
                                        <p style={{ color: '#4f46e5', margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>{booking.route}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px', borderTop: '2px solid #e5e7eb', textAlign: 'center' }}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(qrUrl)}`}
                                alt="Ticket QR Code"
                                style={{ width: '120px', height: '120px', margin: '0 auto' }}
                            />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>Scan for Digital Ticket</p>
                        </div>

                        <div style={{ display: 'flex', borderTop: '2px solid #e5e7eb' }}>
                            {depStr && (
                                <div style={{ flex: 1, padding: '20px', borderRight: '2px solid #e5e7eb' }}>
                                    <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Departure</p>
                                    <p style={{ fontSize: '16px', color: '#111827', margin: 0, fontWeight: '800' }}>{depStr.split(',')[0]}</p>
                                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 0', fontWeight: '600' }}>{depStr.split(',')[1]}</p>
                                </div>
                            )}
                            {arrStr && (
                                <div style={{ flex: 1, padding: '20px' }}>
                                    <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Arrival</p>
                                    <p style={{ fontSize: '16px', color: '#111827', margin: 0, fontWeight: '800' }}>{arrStr.split(',')[0]}</p>
                                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 0', fontWeight: '600' }}>{arrStr.split(',')[1]}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        {booking.passengers?.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px dashed #d1d5db' }}>
                                <span style={{ color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Passenger Seats</span>
                                <span style={{ color: '#111827', fontWeight: '800' }}>{booking.passengers.join(', ')}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px dashed #d1d5db' }}>
                            <span style={{ color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Booked On</span>
                            <span style={{ color: '#111827', fontWeight: '800' }}>{bookedDate}</span>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#eef2ff', padding: '25px', borderRadius: '16px', border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#6366f1', margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Amount Paid</p>
                        </div>
                        <h2 style={{ color: '#4338ca', margin: 0, fontSize: '32px', fontWeight: '900' }}>₹{booking.price}</h2>
                    </div>

                    <div style={{ marginTop: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                        <p>Please carry a valid photo ID matching the passenger names.</p>
                        <p>This is a computer-generated document and does not require a physical signature.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingView;

