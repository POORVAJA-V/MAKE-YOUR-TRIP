import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import PageWrapper from './components/PageWrapper';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import DestinationDetails from './pages/DestinationDetails';
import HotelSearch from './pages/HotelSearch';
import HotelDetails from './pages/HotelDetails';
import FlightSearch from './pages/FlightSearch';
import FlightSeatSelection from './pages/FlightSeatSelection';
import BusFlow from './pages/BusFlow';
import BusSeatSelection from './pages/BusSeatSelection';
import TrainFlow from './pages/TrainFlow';
import TrainSeatSelection from './pages/TrainSeatSelection';
import CabFlow from './pages/CabFlow';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import Auth from './pages/Auth';
import PlaceholderWrapper from './pages/PlaceholderWrapper';
import BookingView from './pages/BookingView';

export default function App() {
    // Intentional Bug (Network & Console): Fetching a non-existent endpoint without a .catch() block.
    // This will result in a 404 in the Network tab and an "Uncaught (in promise)" error in the Console.
    React.useEffect(() => {
        fetch('/api/v1/user/telemetry').then(res => res.json());
    }, []);

    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Navbar />
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/destination/:city" element={<DestinationDetails />} />
                        <Route path="/hotels" element={<HotelSearch />} />
                        <Route path="/hotels/:id" element={<HotelDetails />} />
                        <Route path="/flights" element={<FlightSearch />} />
                        <Route path="/flights/:id/seats" element={<ProtectedRoute><FlightSeatSelection /></ProtectedRoute>} />
                        <Route path="/buses" element={<BusFlow />} />
                        <Route path="/bus-seats" element={<ProtectedRoute><BusSeatSelection /></ProtectedRoute>} />
                        <Route path="/trains" element={<TrainFlow />} />
                        <Route path="/train-seats" element={<ProtectedRoute><TrainSeatSelection /></ProtectedRoute>} />
                        <Route path="/cabs" element={<CabFlow />} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/confirmation" element={<Confirmation />} />
                        <Route path="/booking/:id" element={<BookingView />} />
                        <Route path="/bookings" element={<MyBookings />} />
                        <Route path="/login" element={<Auth type="login" />} />
                        <Route path="/register" element={<Auth type="register" />} />
                        <Route path="/profile" element={<PlaceholderWrapper title="User Profile" />} />
                        <Route path="/wishlist" element={<PlaceholderWrapper title="My Wishlist" />} />
                        <Route path="/admin" element={<PlaceholderWrapper title="Admin Dashboard" />} />
                        <Route path="*" element={<PageWrapper><h2 className="text-center font-bold text-2xl mt-20">404 Not Found</h2></PageWrapper>} />
                    </Routes>
                </AnimatePresence>
            </Router>
        </AuthProvider>
    );
}
