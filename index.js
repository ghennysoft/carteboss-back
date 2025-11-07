import express from 'express';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/ProfileRoute.js';
import PostRoute from './Routes/PostRoute.js';

dotenv.config();
const port = process.env.PORT || 1000;

const corsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === 'development') {
            callback(null, ['http://localhost:5173']);
        } else if (process.env.NODE_ENV === 'test') {
            callback(null, ['https://ghenny-1.onrender.com']);
        } else {
            callback(null, ['http://localhost:5173']);
        }
    },
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(express.static('public'));

let MONGO_URL;

if(process.env.NODE_ENV == 'development') {
    MONGO_URL = mongoose.connect(process.env.MONGODB_LOCAL_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On developpment');
} else if(process.env.NODE_ENV == 'test') {
    MONGO_URL = mongoose.connect(process.env.MONGODB_TEST_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On test');
} else {
    MONGO_URL = mongoose.connect(process.env.MONGODB_PRODUCTION_URL, {
        serverSelectionTimeoutMS: 30000, // 30s au lieu de 10s
    });
    console.log('On production');
}

MONGO_URL
.then(() => {
    console.log('DB Connected');
})
.catch((error) => {
    throw error
});

// Usage of route
app.use('/api/auth', AuthRoute)
app.use('/api/profile', UserRoute)
app.use('/api/post', PostRoute)

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
})

app.listen(port, () => {
    console.log(`Server connected at ${port}`)
})