import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cardVariants, staggerContainer } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';
import dubaiImg from '../../assets/dubai-pictures.jpg';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Intentional Bug (Memory Leak): Adding an event listener without a cleanup function.
        // Every time the user navigates back to Home, a new detached listener accumulates.
        window.addEventListener('scroll', () => {
            const trackScroll = window.scrollY;
        });
    }, []);

    return (
        <PageWrapper className="relative flex flex-col items-center pt-24 pb-20 text-center overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none animate-float" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 max-w-4xl mx-auto px-4 mt-12">
                <div className="inline-block px-4 py-1.5 rounded-full glass border mb-6 text-sm font-bold text-blue-700 uppercase tracking-widest shadow-sm">
                    ✨ Your Gateway to the World
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                    Travel <span className="gradient-text">Beautifully</span>
                </h1>
                {/* Intentional Bug (Console Error): A block-level <div> nested inside an inline <p>.
                    Visually nothing changes, but React throws a large "validateDOMNesting" error in the console. */}
                <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                    Experience seamless bookings with exclusive deals on premium stays, luxury flights, and global transit.
                    <div className="hidden" aria-hidden="true">Tracker</div>
                </p>
            </motion.div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 w-full max-w-6xl px-4 mb-24">
                {[
                    { name: 'Hotels', path: '/hotels', gradient: 'from-blue-500 to-sky-400', icon: '🏨' },
                    { name: 'Flights', path: '/flights', gradient: 'from-indigo-500 to-purple-400', icon: '✈️' },
                    { name: 'Buses', path: '/buses', gradient: 'from-orange-500 to-amber-400', icon: '🚌' },
                    { name: 'Trains', path: '/trains', gradient: 'from-emerald-500 to-teal-400', icon: '🚆' },
                    { name: 'Cabs', path: '/cabs', gradient: 'from-rose-500 to-pink-400', icon: '🚕' }
                ].map((item) => (
                    <motion.div key={item.name} variants={cardVariants} whileHover="hover" whileTap="tap"
                        onClick={() => navigate(item.path)}
                        className="relative cursor-pointer group rounded-3xl overflow-hidden glass aspect-square flex flex-col items-center justify-center p-6 border-slate-200 hover:border-transparent transition-colors duration-300">

                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {item.icon}
                        </div>
                        <span className="font-bold text-slate-800 text-lg md:text-xl group-hover:text-blue-700 transition-colors">{item.name}</span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Featured Section */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="w-full max-w-6xl px-4 text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-6">Trending Destinations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Kyoto', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Santorini', img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Dubai', img: 'https://wallpaperaccess.com/full/222689.jpg' }
                    ].map((dest, i) => (
                        <div key={i}
                            onClick={() => navigate(`/destination/${encodeURIComponent(dest.name)}`)}
                            className="group rounded-2xl overflow-hidden shadow-md h-40 md:h-48 relative cursor-pointer border border-slate-200">
                            <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-5">
                                <h3 className="text-white text-xl font-bold drop-shadow-md">{dest.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </PageWrapper>
    );
};
export default Home;
