import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

const Confirmation = () => {
    return (
        <PageWrapper className="flex flex-col items-center justify-center pt-32 text-center relative overflow-hidden">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl">
                <span className="text-white text-4xl font-bold">✓</span>
            </motion.div>
            <h2 className="text-4xl font-extrabold mb-4">Booking Confirmed!</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md">Your payment was successful and your itinerary is ready.</p>
            <Link to="/bookings" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 hover:border-blue-800 transition">View My Trips</Link>
        </PageWrapper>
    );
};
export default Confirmation;
