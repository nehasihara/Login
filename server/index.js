const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const EmployeeModel = require("./models/Employee");

const app = express();
app.use(express.json());

// Define allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5181', 'http://localhost:5174'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // deny the request
        }
    }
}));

// Handle preflight requests
app.options('*', cors()); // Enable preflight for all routes

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/employee", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB");

    // Start the server after successful connection
    app.listen(3001, () => {
        console.log("Server is running on port 3001");
    });
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success");
                } else {
                    res.json("The password is incorrect");
                }
            } else {
                res.json("No record existed");
            }
        })
        .catch(err => {
            console.error("Error during login:", err);
            res.status(500).json("An error occurred");
        });
});

// Registration route
app.post('/register', (req, res) => {
    const { email } = req.body; // Extract the email from the request body

    // Check if the email already exists
    EmployeeModel.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                // If a user with this email already exists
                return res.status(400).json({ message: "Email already in use." });
            }
            // If no existing user found, create a new one
            return EmployeeModel.create(req.body);
        })
        .then(employee => res.status(201).json(employee)) // Respond with the newly created employee
        .catch(err => {
            console.error("Error during registration:", err);
            res.status(500).json(err); // Send error response
        });
});
