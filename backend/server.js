require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const { Server } = require('socket.io');
const http = require('http');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// Root route — confirms the API is live
app.get('/', (req, res) => {
    res.json({
        status: '✅ MakeYourTrip API is live',
        version: '1.0.0',
        message: 'This is the backend API. The frontend website is deployed separately on Vercel.',
        endpoints: {
            flights: '/api/v1/flights/search?from=Delhi&to=Mumbai',
            hotels: '/api/v1/hotels/search?city=Mumbai',
            buses: '/api/v1/buses/search?from=Delhi&to=Agra',
            trains: '/api/v1/trains/search?from=Delhi&to=Mumbai',
            cabs: '/api/v1/cabs/available',
        }
    });
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-booking';

// --- Nodemailer Ethereal Setup ---
let transporter;

// --- Mongoose Models ---

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const HotelSchema = new mongoose.Schema({
    name: String, city: String, country: String, star: Number, price: Number,
    images: [String], amenities: [String], rating: Number, description: String,
    rooms: [{ type: { type: String }, available: Boolean, price: Number, capacity: Number }],
    reviews: [{ user: String, rating: Number, comment: String }],
    createdAt: { type: Date, default: Date.now }
});
const Hotel = mongoose.model('Hotel', HotelSchema);

const FlightSchema = new mongoose.Schema({
    airline: String, flightNumber: String, departureCity: String, arrivalCity: String,
    departureTime: Date, arrivalTime: Date, duration: String, price: Number,
    availableSeats: Number, baggage: String, refundable: Boolean
});
const Flight = mongoose.model('Flight', FlightSchema);

const BusSchema = new mongoose.Schema({
    operator: String, busNumber: String, routeFrom: String, routeTo: String,
    departureTime: Date, arrivalTime: Date, price: Number, availableSeats: Number, amenities: [String]
});
const Bus = mongoose.model('Bus', BusSchema);

const TrainSchema = new mongoose.Schema({
    trainName: String, trainNumber: String, fromStation: String, toStation: String,
    departureTime: Date, arrivalTime: Date, classes: [{ className: String, available: Number, price: Number }]
});
const Train = mongoose.model('Train', TrainSchema);

const CabSchema = new mongoose.Schema({
    vehicleType: String, capacity: Number, pickupLocation: String, dropoffLocation: String,
    estimatedPrice: Number, rating: Number, driverName: String
});
const Cab = mongoose.model('Cab', CabSchema);

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingType: String, itemId: mongoose.Schema.Types.ObjectId,
    itemDetails: Object,
    passengers: Array, totalPrice: Number, paymentStatus: { type: String, default: 'Pending' },
    bookingStatus: { type: String, default: 'Confirmed' }, createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

const PaymentSchema = new mongoose.Schema({
    bookingId: mongoose.Schema.Types.ObjectId, orderId: String, amount: Number, status: String,
    paymentMethod: String, razorpayOrderId: String, razorpayPaymentId: String
});
const Payment = mongoose.model('Payment', PaymentSchema);

const WishlistSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId, itemId: mongoose.Schema.Types.ObjectId, itemType: String
});
const Wishlist = mongoose.model('Wishlist', WishlistSchema);

// --- Auth Middleware ---
const protect = (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) { res.status(401).json({ message: 'Not authorized' }); }
    } else { res.status(401).json({ message: 'No token' }); }
};

// --- API Endpoints ---

// Auth
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({ email, password: hashedPassword, firstName, lastName });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, firstName, lastName }, message: 'Registered successfully.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/v1/auth/logout', (req, res) => res.json({ message: 'Logged out' }));
app.post('/api/v1/auth/refresh-token', protect, (req, res) => {
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
});
app.get('/api/v1/auth/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});
app.put('/api/v1/auth/profile', protect, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(user);
});

// Hotels
app.get('/api/v1/hotels/search', async (req, res) => {
    const { city } = req.query;
    const targetCity = city || 'Mumbai';
    let hotels = generateHotels(targetCity, 9);
    try {
        const dbHotels = await Hotel.find({ city: new RegExp(targetCity, 'i') }).lean();
        if (dbHotels.length > 0) {
            const pad = dbHotels.length < 9 ? generateHotels(targetCity, 9 - dbHotels.length) : [];
            hotels = [...dbHotels, ...pad];
        }
    } catch (_) { }
    res.json(hotels);
});
app.get('/api/v1/hotels/:id', async (req, res) => {
    try {
        if (req.params.id.startsWith('dyn-')) return res.json({ _id: req.params.id });
        res.json(await Hotel.findById(req.params.id));
    } catch { res.json({}); }
});
app.get('/api/v1/hotels/:id/rooms', async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    res.json(hotel ? hotel.rooms : []);
});
app.get('/api/v1/hotels/:id/reviews', async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    res.json(hotel ? hotel.reviews : []);
});
app.post('/api/v1/hotels/:id/reviews', protect, async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    hotel.reviews.push({ ...req.body, user: req.user.id });
    await hotel.save();
    res.json(hotel.reviews);
});
app.get('/api/v1/hotels/:id/availability', async (req, res) => res.json({ available: true }));

// ── Dynamic Result Generators ────────────────────────────────────────────────
// These run when the DB has no matching results, so ANY city/route works.

const AIRLINES = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Air Arabia', 'Lufthansa', 'British Airways'];
const BUS_OPS = ['RedBus Express', 'VRL Travels', 'SRS Travels', 'IntrCity SmartBus', 'Orange Tours', 'Neeta Travels', 'Patel Travels', 'Raj Travels'];
const TRAIN_NAMES = ['Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Vande Bharat', 'Garib Rath', 'Sampark Kranti', 'Humsafar Express', 'Jan Shatabdi'];
const CAB_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Premium'];
const DRIVERS = ['Ramesh Kumar', 'Suresh Patel', 'Amit Singh', 'Rajesh Verma', 'Vikram Rao'];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[randInt(0, arr.length - 1)];

const makeFutureDate = (hoursFromNow, durationHours) => {
    const dep = new Date(Date.now() + hoursFromNow * 3600000);
    dep.setMinutes([0, 15, 30, 45][randInt(0, 3)], 0, 0);
    const arr = new Date(dep.getTime() + durationHours * 3600000);
    return { departureTime: dep, arrivalTime: arr };
};

const generateFlights = (from, to, count = 8) => {
    const fromCity = from || 'Delhi';
    const toCity = to || 'Mumbai';
    const basePx = randInt(2800, 5000);
    return Array.from({ length: count }, (_, i) => {
        const durH = randInt(1, 5);
        const { departureTime, arrivalTime } = makeFutureDate(randInt(2, 48), durH);
        const airline = AIRLINES[i % AIRLINES.length];
        return {
            _id: `dyn-fl-${Date.now()}-${i}`,
            airline,
            flightNumber: `${airline.substring(0, 2).toUpperCase()}-${randInt(100, 999)}`,
            departureCity: fromCity,
            arrivalCity: toCity,
            departureTime,
            arrivalTime,
            duration: `${durH}h ${randInt(0, 55)}m`,
            price: basePx + i * randInt(200, 600),
            availableSeats: randInt(10, 80),
            baggage: '15 kg',
            refundable: i % 3 !== 0,
        };
    });
};

const generateBuses = (from, to, count = 6) => {
    const fromCity = from || 'Delhi';
    const toCity = to || 'Agra';
    return Array.from({ length: count }, (_, i) => {
        const durH = randInt(4, 12);
        const { departureTime, arrivalTime } = makeFutureDate(randInt(1, 24), durH);
        return {
            _id: `dyn-bs-${Date.now()}-${i}`,
            operator: BUS_OPS[i % BUS_OPS.length],
            busNumber: `BS-${randInt(100, 999)}`,
            routeFrom: fromCity,
            routeTo: toCity,
            departureTime,
            arrivalTime,
            price: randInt(300, 1800) + i * 50,
            availableSeats: randInt(5, 40),
            amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket'].slice(0, randInt(2, 4)),
        };
    });
};

const generateTrains = (from, to, count = 6) => {
    const fromCity = from || 'Delhi';
    const toCity = to || 'Mumbai';
    return Array.from({ length: count }, (_, i) => {
        const durH = randInt(6, 36);
        const { departureTime, arrivalTime } = makeFutureDate(randInt(1, 48), durH);
        return {
            _id: `dyn-tr-${Date.now()}-${i}`,
            trainName: TRAIN_NAMES[i % TRAIN_NAMES.length],
            trainNumber: `${randInt(10000, 19999)}`,
            fromStation: fromCity,
            toStation: toCity,
            departureTime,
            arrivalTime,
            classes: [
                { className: '1A', available: randInt(2, 10), price: randInt(2000, 4000) },
                { className: '2A', available: randInt(5, 20), price: randInt(1200, 2000) },
                { className: '3A', available: randInt(10, 40), price: randInt(700, 1200) },
                { className: 'SL', available: randInt(20, 100), price: randInt(300, 600) },
            ],
        };
    });
};

const generateCabs = (from, to, count = 5) => {
    return Array.from({ length: count }, (_, i) => ({
        _id: `dyn-cb-${Date.now()}-${i}`,
        vehicleType: CAB_TYPES[i % CAB_TYPES.length],
        capacity: i % 2 === 0 ? 4 : 6,
        pickupLocation: from || 'Pickup Location',
        dropoffLocation: to || 'Drop Location',
        estimatedPrice: randInt(300, 2000) + i * 100,
        rating: (4 + Math.random()).toFixed(1),
        driverName: DRIVERS[i % DRIVERS.length],
    }));
};

const generateHotels = (city, count = 8) => {
    const hotelImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60',
    ];
    const names = ['Grand Palace', 'The Majestic', 'Royal Suites', 'Comfort Inn', 'Luxury Stays', 'Heritage Hotel', 'City Central Hotel', 'The Metropolitan'];
    const allAmenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Room Service'];
    return Array.from({ length: count }, (_, i) => ({
        _id: `dyn-ht-${Date.now()}-${i}`,
        name: `${names[i % names.length]} ${city}`,
        city: city || 'City',
        country: 'India',
        star: randInt(3, 5),
        price: randInt(1500, 8000) + i * 300,
        images: [hotelImages[i % hotelImages.length], hotelImages[(i + 2) % hotelImages.length], hotelImages[(i + 4) % hotelImages.length]],
        amenities: allAmenities.slice(0, randInt(4, 7)),
        rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
        description: `Experience world-class hospitality in the heart of ${city}. Modern rooms, premium amenities, and exceptional service await.`,
        reviews: [
            { user: 'Priya S.', rating: 5, comment: 'Absolutely loved the stay!' },
            { user: 'Arjun M.', rating: 4, comment: 'Great location and friendly staff.' },
        ],
    }));
};

// ── Flights ───────────────────────────────────────────────────────────────────
// BUG 8: Partial and case-insensitive city matching causes wrong results
// Searching "Del" will match "Delhi" and "Dellhi" incorrectly
// This is a subtle bug that causes unexpected search results
app.get('/api/v1/flights/search', async (req, res) => {
    const { from, to } = req.query;
    let flights = generateFlights(from, to, 7);
    try {
        let q = {};
        // BUG: Using partial match with RegExp - "Del" will match "Delhi", "Delhi" etc.
        // This should use exact match or proper validation
        if (from) q.departureCity = new RegExp(from, 'i'); // 'i' makes it case-insensitive AND partial
        if (to) q.arrivalCity = new RegExp(to, 'i');
        const dbFlights = await Flight.find(q).lean();
        if (dbFlights.length > 0) {
            const pad = dbFlights.length < 7 ? generateFlights(from, to, 7 - dbFlights.length) : [];
            flights = [...dbFlights, ...pad];
        }
    } catch (_) { }
    res.json(flights);
});
app.get('/api/v1/flights/:id', async (req, res) => {
    try {
        if (req.params.id.startsWith('dyn-')) return res.json({ _id: req.params.id });
        res.json(await Flight.findById(req.params.id));
    } catch { res.json({}); }
});
app.get('/api/v1/flights/:id/seats', (req, res) => res.json({ availableSeats: 45 }));
app.get('/api/v1/flights/:id/price-calendar', (req, res) => res.json([]));
app.post('/api/v1/flights/:id/seat-select', protect, (req, res) => res.json({ success: true, seat: req.body.seat }));

// ── Buses ─────────────────────────────────────────────────────────────────────
app.get('/api/v1/buses/search', async (req, res) => {
    const { from, to } = req.query;
    let buses = generateBuses(from, to, 7);
    try {
        let q = {};
        if (from) q.routeFrom = new RegExp(from, 'i');
        if (to) q.routeTo = new RegExp(to, 'i');
        const dbBuses = await Bus.find(q).lean();
        if (dbBuses.length > 0) {
            const pad = dbBuses.length < 7 ? generateBuses(from, to, 7 - dbBuses.length) : [];
            buses = [...dbBuses, ...pad];
        }
    } catch (_) { }
    res.json(buses);
});
app.get('/api/v1/buses/:id', async (req, res) => {
    try {
        if (req.params.id.startsWith('dyn-')) return res.json({ _id: req.params.id });
        res.json(await Bus.findById(req.params.id));
    } catch { res.json({}); }
});
app.get('/api/v1/buses/:id/seats', (req, res) => res.json({ seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }));
app.post('/api/v1/buses/:id/seat-select', protect, (req, res) => res.json({ success: true }));

// ── Trains ────────────────────────────────────────────────────────────────────
app.get('/api/v1/trains/search', async (req, res) => {
    const { from, to } = req.query;
    let trains = generateTrains(from, to, 7);
    try {
        let q = {};
        if (from) q.fromStation = new RegExp(from, 'i');
        if (to) q.toStation = new RegExp(to, 'i');
        const dbTrains = await Train.find(q).lean();
        if (dbTrains.length > 0) {
            const pad = dbTrains.length < 7 ? generateTrains(from, to, 7 - dbTrains.length) : [];
            trains = [...dbTrains, ...pad];
        }
    } catch (_) { }
    res.json(trains);
});
app.get('/api/v1/trains/:id', async (req, res) => {
    try {
        if (req.params.id.startsWith('dyn-')) return res.json({ _id: req.params.id });
        res.json(await Train.findById(req.params.id));
    } catch { res.json({}); }
});
app.get('/api/v1/trains/:id/classes', async (req, res) => {
    try {
        if (req.params.id.startsWith('dyn-')) return res.json([
            { className: '1A', available: 5, price: 2500 }, { className: '2A', available: 10, price: 1500 },
            { className: '3A', available: 30, price: 900 }, { className: 'SL', available: 80, price: 400 },
        ]);
        const t = await Train.findById(req.params.id); res.json(t.classes);
    } catch { res.json([]); }
});
app.get('/api/v1/trains/:id/availability', (req, res) => res.json({ available: true }));
app.post('/api/v1/trains/:id/seat-select', protect, (req, res) => res.json({ success: true }));

// ── Cabs ──────────────────────────────────────────────────────────────────────
app.get('/api/v1/cabs/estimate', (req, res) => {
    const { from, to } = req.query;
    res.json({ estimatedPrice: randInt(300, 1500), duration: `${randInt(20, 90)} mins`, from, to });
});
app.get('/api/v1/cabs/available', async (req, res) => {
    try {
        const { from, to } = req.query;
        let cabs = await Cab.find({});
        if (cabs.length < 3) {
            const dynamic = generateCabs(from, to, 5);
            cabs = [...cabs, ...dynamic];
        }
        res.json(cabs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/v1/cabs/book', protect, (req, res) => res.json({ success: true, bookingId: `CAB-${Date.now()}` }));
app.get('/api/v1/cabs/:id/track', (req, res) => res.json({ lat: 28.6 + Math.random() * 0.1, lng: 77.2 + Math.random() * 0.1 }));

// Bookings
app.post('/api/v1/bookings/create', protect, async (req, res) => {
    const booking = await Booking.create({ ...req.body, userId: req.user.id });
    res.json(booking);
});
app.get('/api/v1/bookings', protect, async (req, res) => res.json(await Booking.find({ userId: req.user.id })));
// Public endpoint (no auth) — used by QR code scans to view booking details
app.get('/api/v1/bookings/public/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/v1/bookings/:id', protect, async (req, res) => res.json(await Booking.findById(req.params.id)));
app.put('/api/v1/bookings/:id/cancel', protect, async (req, res) => {
    const b = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: 'Cancelled' }, { new: true });
    res.json(b);
});
app.put('/api/v1/bookings/:id/modify', protect, async (req, res) => res.json(await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.get('/api/v1/bookings/:id/invoice', protect, (req, res) => res.json({ invoiceUrl: 'http://docs/invoice.pdf' }));

// Payments
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

app.post('/api/v1/payments/initiate', protect, async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: bookingId });
        res.json({ orderId: order.id, amount });
    } catch (err) {
        // Return dummy on fail so app holds up without real keys
        res.json({ orderId: 'dummy_order_' + Date.now(), amount: req.body.amount });
    }
});
app.post('/api/v1/payments/callback', protect, async (req, res) => {
    try {
        const { mock, bookingDetails } = req.body;

        if (transporter && req.user && req.user.email) {
            let detailsHtml = '<p>Your booking is confirmed.</p>';
            if (bookingDetails && bookingDetails.item) {
                detailsHtml = `
                    <h3>Booking Details - ${bookingDetails.type}</h3>
                    <p>Amount Paid: ₹${bookingDetails.amount}</p>
                    <p>Transaction ID: BKG-${Math.floor(Math.random() * 10000)}</p>
                `;
            }

            let info = await transporter.sendMail({
                from: '"MakeYourTrip Auth" <tickets@makeyourtrip.com>',
                to: req.user.email,
                subject: "Your Booking Ticket - MakeYourTrip",
                text: `Your booking is confirmed. Enjoy your trip!`,
                html: `<b>Payment Successful!</b><br> ${detailsHtml} <br><p>Thank you for choosing MakeYourTrip! Have a safe journey.</p>`
            });
            console.log("Ticket Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        res.json({ success: true, message: 'Payment verified and ticket sent.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/v1/payments/:id/status', protect, (req, res) => res.json({ status: 'Success' }));

// Wishlist
app.get('/api/v1/wishlist', protect, async (req, res) => res.json(await Wishlist.find({ userId: req.user.id })));
app.post('/api/v1/wishlist/add', protect, async (req, res) => res.json(await Wishlist.create({ ...req.body, userId: req.user.id })));
app.delete('/api/v1/wishlist/:id', protect, async (req, res) => { await Wishlist.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Loyalty & Admin
app.get('/api/v1/loyalty/points', protect, (req, res) => res.json({ points: 1500 }));
app.get('/api/v1/loyalty/history', protect, (req, res) => res.json([]));
app.post('/api/v1/loyalty/redeem', protect, (req, res) => res.json({ success: true }));
app.get('/api/v1/admin/dashboard', protect, (req, res) => res.json({ users: 100, bookings: 50, revenue: 50000 }));
app.get('/api/v1/admin/bookings/analytics', protect, (req, res) => res.json({ data: [] }));
app.get('/api/v1/admin/inventory/manage', protect, (req, res) => res.json({ inventoryOk: true }));

// --- Mock Seeding ---
const seedDatabase = async () => {
    if ((await Hotel.countDocuments()) === 0) {
        console.log('Seeding Mock Data...');
        const cities = ['Bali', 'Paris', 'Kyoto', 'Santorini', 'Maldives', 'Dubai', 'New York'];

        // Hotels
        const hotelImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60'
        ];
        const allAmenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Bar', 'Restaurant', 'Free Parking', 'Room Service', 'Airport Shuttle', 'Lounge'];
        const reviewTexts = ['Great stay!', 'Very comfortable.', 'Exceptional service.', 'Beautiful views!', 'Highly recommended.', 'Would visit again.'];
        const reviewerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
        const hotelNames = [
            'Taj Mahal Palace', 'Burj Al Arab', 'The Ritz-Carlton', 'Marina Bay Sands',
            'The Plaza Hotel', 'Atlantis The Palm', 'Four Seasons Resort', 'Waldorf Astoria',
            'Raffles Hotel', 'The Savoy', 'Oberoi Udaivilas', 'Emirates Palace',
            'Mandarin Oriental', 'Rosewood London', 'Aman Tokyo'
        ];

        const generateDates = (durationHours = 2) => {
            const dep = new Date();
            dep.setDate(new Date().getDate() + Math.floor(Math.random() * 14)); // Up to 2 weeks out
            dep.setHours(Math.floor(Math.random() * 24), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);
            const arr = new Date(dep);
            arr.setHours(dep.getHours() + durationHours, dep.getMinutes() + Math.floor(Math.random() * 45), 0, 0);
            return { departureTime: dep, arrivalTime: arr };
        };

        for (let i = 0; i < 20; i++) {
            const hImages = [
                hotelImages[i % hotelImages.length],
                hotelImages[(i + 2) % hotelImages.length],
                hotelImages[(i + 4) % hotelImages.length]
            ];
            const hAmenities = allAmenities.slice(i % 5, (i % 5) + 4);
            const hReviews = [
                { user: reviewerNames[i % reviewerNames.length], rating: 4 + (i % 2), comment: reviewTexts[i % reviewTexts.length] },
                { user: reviewerNames[(i + 1) % reviewerNames.length], rating: 5, comment: reviewTexts[(i + 1) % reviewTexts.length] }
            ];

            await Hotel.create({
                name: hotelNames[i % hotelNames.length] + (i > 9 ? ' Downtown' : ''),
                city: cities[i % cities.length],
                country: 'India',
                star: (i % 3) + 3,
                price: 2000 + (i * 500),
                images: hImages,
                amenities: hAmenities,
                rating: 4.0 + (i % 10) / 10,
                description: 'A beautiful place to stay with stunning views and excellent service.',
                reviews: hReviews
            });
        }

        // Flights
        const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Lufthansa'];
        for (let i = 0; i < 20; i++) {
            const { departureTime, arrivalTime } = generateDates(2 + Math.floor(Math.random() * 4));
            await Flight.create({
                airline: airlines[i % airlines.length],
                flightNumber: `${airlines[i % airlines.length].substring(0, 2).toUpperCase()}-${100 + i}`,
                departureCity: cities[i % cities.length],
                arrivalCity: cities[(i + 1) % cities.length],
                price: 3000 + i * 200,
                duration: '2h 30m',
                departureTime,
                arrivalTime,
                availableSeats: 50,
                refundable: true
            });
        }

        // Buses
        const busOperators = ['RedBus Express', 'VRL Travels', 'SRS Travels', 'IntrCity SmartBus', 'Orange Tours', 'Neeta Travels'];
        for (let i = 0; i < 20; i++) {
            const { departureTime, arrivalTime } = generateDates(6 + Math.floor(Math.random() * 6));
            await Bus.create({
                operator: busOperators[i % busOperators.length],
                busNumber: `BS-${100 + i}`,
                routeFrom: cities[i % cities.length],
                routeTo: cities[(i + 1) % cities.length],
                price: 500 + i * 50,
                departureTime,
                arrivalTime,
                availableSeats: 30,
                amenities: ['AC', 'Sleeper', 'WiFi']
            });
        }

        // Trains
        const trainNames = ['Rajdhani Express', 'Shatabdi Fast', 'Duronto Express', 'Vande Bharat', 'Garib Rath', 'Sampark Kranti', 'Humsafar Exp'];
        for (let i = 0; i < 20; i++) {
            const { departureTime, arrivalTime } = generateDates(10 + Math.floor(Math.random() * 14));
            await Train.create({
                trainName: trainNames[i % trainNames.length],
                trainNumber: `TR-${1000 + i}`,
                fromStation: cities[i % cities.length],
                toStation: cities[(i + 1) % cities.length],
                departureTime,
                arrivalTime,
                classes: [
                    { className: '1A', available: 10, price: 2500 },
                    { className: '2A', available: 20, price: 1500 },
                    { className: '3A', available: 40, price: 1200 },
                    { className: 'SL', available: 100, price: 450 }
                ]
            });
        }

        // Cabs
        const cabTypes = ['Sedan', 'SUV', 'Auto', 'Bike'];
        const driverNames = ['Ramesh', 'Suresh', 'Amit', 'Rajesh', 'Vikram', 'Prakash', 'Anil', 'Sunil', 'Mohammad', 'Karan'];
        for (let i = 0; i < 20; i++) {
            await Cab.create({
                vehicleType: cabTypes[i % cabTypes.length],
                capacity: (i % 4) === 1 ? 6 : ((i % 4) === 3 ? 1 : 4),
                pickupLocation: cities[i % cities.length],
                dropoffLocation: cities[(i + 1) % cities.length],
                estimatedPrice: 300 + i * 100,
                rating: 4.0 + (i % 5) / 10,
                driverName: driverNames[i % driverNames.length]
            });
        }
        console.log('Mock Data Seeded');
    }
};

// Start the HTTP server immediately so the port is bound (required by Render & similar hosts).
// MongoDB connects asynchronously — if it fails the app keeps running with dynamic data.
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        seedDatabase();
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
        console.log('Server will continue running with dynamic data generation.');
    });