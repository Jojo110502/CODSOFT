require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');




const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/travel_booking_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB', error);
});


const secretKey = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const BookingSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    destination: String,
    date: Date,
    status: String
});

const DestinationSchema = new mongoose.Schema({
    name: String,
    description: String,
    location: String
});

const User = mongoose.model('User', UserSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Destination = mongoose.model('Destination', DestinationSchema);

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, secretKey);
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

app.post('/book', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const { userId } = jwt.verify(token, secretKey);
        const { destination, date } = req.body;

        if (!userId || !destination || !date) {
            return res.status(400).send('Missing required fields');
        }

        const booking = new Booking({
            user_id: userId,
            destination,
            date,
            status: 'Confirmed'
        });

        await booking.save();
        res.status(201).send('Booking confirmed');
    } catch (error) {
        console.error('Booking error:', error.message); // More detailed logging
        res.status(500).send('Error booking');
    }
});



// Search for bookings by user ID
app.get('/bookings', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = jwt.verify(token, secretKey);
    const bookings = await Booking.find({ user_id: userId });
    res.json(bookings);
});

// Search for destinations (optional)
app.get('/destinations', async (req, res) => {
    const destinations = await Destination.find({});
    res.json(destinations);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});