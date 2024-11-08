// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS
import urlRoutes from './routes/urlRoutes.js';

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// API routes
app.use('/', urlRoutes);

export default app;
