import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 w-full z-50 h-20 flex items-center justify-between px-6 md:px-12 glass border-b-white/50 transition-all duration-300">
            <div className="flex items-center">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden mr-4 text-slate-800 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
                <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter flex items-center">
                    <svg className="w-8 h-8 mr-2 text-blue-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    MakeYourTrip
                </Link>
            </div>

            <div className="hidden lg:flex space-x-2 bg-white/50 p-1.5 rounded-full border border-white shadow-sm backdrop-blur-md">
                {[
                    { name: 'Hotels', path: '/hotels' },
                    { name: 'Flights', path: '/flights' },
                    { name: 'Buses', path: '/buses' },
                    { name: 'Trains', path: '/trains' },
                    { name: 'Cabs', path: '/cabs' }
                ].map(nav => (
                    <Link key={nav.name} to={nav.path}
                        className={`relative px-5 py-2 rounded-full font-bold text-sm transition-colors duration-300 ${isActive(nav.path) ? 'text-white' : 'text-slate-600 hover:text-blue-600'}`}>
                        {isActive(nav.path) && (
                            <motion.div layoutId="nav-pill" className="absolute inset-0 bg-slate-900 rounded-full shadow-md" transition={{ type: "spring", stiffness: 350, damping: 30 }} style={{ zIndex: -1 }} />
                        )}
                        {nav.name}
                    </Link>
                ))}
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl overflow-hidden lg:hidden flex flex-col z-[110]">
                        {[
                            { name: 'Hotels', path: '/hotels' },
                            { name: 'Flights', path: '/flights' },
                            { name: 'Buses', path: '/buses' },
                            { name: 'Trains', path: '/trains' },
                            { name: 'Cabs', path: '/cabs' }
                        ].map(nav => (
                            <Link key={nav.name} to={nav.path} onClick={() => setMobileMenuOpen(false)}
                                className={`px-6 py-5 font-bold border-b border-slate-100 transition-colors ${isActive(nav.path) ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {nav.name}
                            </Link>
                        ))}
                        
                        {/* Mobile User Menu - Only show My Trips and Logout here (not in profile dropdown on mobile) */}
                        <div className="border-t border-slate-100 mt-2">
                            {user ? (
                                <>
                                    <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="px-6 py-5 font-bold text-slate-600 hover:bg-slate-50 flex items-center">
                                        <span className="mr-3">🧳</span> My Trips
                                    </Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-6 py-5 font-bold text-rose-600 hover:bg-rose-50 flex items-center">
                                        <span className="mr-3">🚪</span> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-6 py-5 font-bold text-slate-600 hover:bg-slate-50 flex items-center">
                                        <span className="mr-3">🔑</span> Log In
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-6 py-5 font-bold text-blue-600 hover:bg-blue-50 flex items-center">
                                        <span className="mr-3">✈️</span> Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center">
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 bg-white/60 hover:bg-white p-1 pl-2 pr-3 border border-slate-200 rounded-full shadow-sm backdrop-blur-md transition-all cursor-pointer"
                        >
                            <span className="text-slate-700 font-bold text-sm hidden sm:inline">
                                Hi, <span className="text-blue-600">{user.firstName || 'Traveler'}</span>
                            </span>
                            <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-[10px]">
                                {(user.firstName || 'T')[0].toUpperCase()}
                            </div>
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col z-[100]"
                                >
                                    <div className="p-4 border-b border-slate-50 bg-slate-50">
                                        <p className="font-bold text-slate-800 truncate">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                                    </div>
                                    <div className="p-2 border-t border-slate-100">
                                        <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-bold text-rose-600 transition-colors flex items-center">
                                            <span className="mr-3 text-lg">🚪</span> Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center space-x-3">
                        <Link to="/login" className="text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors">Log In</Link>
                        <Link to="/register" className="bg-slate-900 text-white hover:bg-blue-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
