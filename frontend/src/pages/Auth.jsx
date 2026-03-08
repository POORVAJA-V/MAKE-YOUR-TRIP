import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { cardVariants, btnVariants } from '../utils/animations';
import PageWrapper from '../components/PageWrapper';

const Auth = ({ type }) => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', firstName: '' });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
            const res = await api.post(endpoint, formData);

            login(res.data);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert(`Authentication Error: ${msg}`);
        }
    };

    return (
        <PageWrapper className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.form
                variants={cardVariants}
                className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100"
                onSubmit={onSubmit}
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {type === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {type === 'login' ? 'Please enter your details to sign in.' : 'Join us and start booking your dream trips.'}
                    </p>
                </div>

                <div className="space-y-5">
                    {type !== 'login' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                placeholder="e.g. John"
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            type="email"
                            placeholder="you@example.com"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            type="password"
                            placeholder="••••••••"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <motion.button
                    variants={btnVariants}
                    whileTap="tap"
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-1"
                    type="submit"
                >
                    {type === 'login' ? 'Sign In' : 'Sign Up'}
                </motion.button>

                <p className="text-center mt-8 text-gray-600">
                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <Link to={type === 'login' ? '/register' : '/login'} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        {type === 'login' ? 'Create one now' : 'Log in here'}
                    </Link>
                </p>
            </motion.form>
        </PageWrapper>
    );
};
export default Auth;
