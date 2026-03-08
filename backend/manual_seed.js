const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/travel-booking';

const HotelSchema = new mongoose.Schema({
    name: String, city: String, country: String, star: Number, price: Number,
    images: [String], amenities: [String], rating: Number, description: String,
    reviews: [{ user: String, rating: Number, comment: String }]
});
const Hotel = mongoose.model('Hotel', HotelSchema);

const FlightSchema = new mongoose.Schema({
    airline: String, flightNumber: String, departureCity: String, arrivalCity: String,
    departureTime: Date, arrivalTime: Date, duration: String, price: Number,
    availableSeats: Number, refundable: Boolean
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

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected correctly. Dropping old data...');
        await mongoose.connection.db.dropDatabase();

        console.log('Seeding Mock Data...');
        const cities = ['Bali', 'Paris', 'Kyoto', 'Santorini', 'Maldives', 'Dubai', 'New York', 'Pune', 'Delhi', 'Mumbai', 'Bangalore'];

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
        const allAmenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Bar', 'Restaurant', 'Free Parking'];
        const reviewTexts = ['Great stay!', 'Very comfortable.', 'Exceptional service.', 'Beautiful views!'];
        const reviewerNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
        const hotelNames = [
            'Taj Mahal Palace', 'Burj Al Arab', 'The Ritz-Carlton', 'Marina Bay Sands',
            'The Plaza Hotel', 'Atlantis The Palm', 'Four Seasons Resort', 'Waldorf Astoria'
        ];

        const generateDates = (durationHours = 2) => {
            const dep = new Date();
            dep.setDate(new Date().getDate() + Math.floor(Math.random() * 14));
            dep.setHours(Math.floor(Math.random() * 24), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);
            const arr = new Date(dep);
            arr.setHours(dep.getHours() + durationHours, dep.getMinutes() + Math.floor(Math.random() * 45), 0, 0);
            return { departureTime: dep, arrivalTime: arr };
        };

        for (let i = 0; i < 20; i++) {
            await Hotel.create({
                name: hotelNames[i % hotelNames.length] + (i > 7 ? ' Downtown' : ''),
                city: cities[i % cities.length],
                country: 'India',
                star: (i % 3) + 3,
                price: 2000 + (i * 500),
                images: [
                    hotelImages[i % hotelImages.length],
                    hotelImages[(i + 2) % hotelImages.length],
                    hotelImages[(i + 4) % hotelImages.length]
                ],
                amenities: allAmenities.slice(i % 3, (i % 3) + 4),
                rating: 4.0 + (i % 10) / 10,
                description: 'A beautiful place to stay.',
                reviews: [{ user: reviewerNames[i % 4], rating: 5, comment: reviewTexts[i % 4] }]
            });
        }

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

        console.log('FINISHED SEEDING ALL DATA!');
        process.exit(0);
    } catch (e) {
        console.error("SEEDING FAILED", e);
        process.exit(1);
    }
};

seedDatabase();
