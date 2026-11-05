import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';

async function connectMongoDB(mongoUri?: string) {
    try {
        const MONGO_URI = mongoUri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nakano';

        // MongoDB Atlas SRV requires working DNS resolution. Force public DNS
        // resolvers ONLY for mongodb+srv:// URIs — hardcoding 8.8.8.8 breaks
        // name resolution inside mainland-China VPCs / private endpoints.
        if (MONGO_URI.startsWith('mongodb+srv://')) {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        }

        // Log the target host/db only — NEVER the full URI (it embeds credentials)
        try {
            const redacted = MONGO_URI.replace(/\/\/[^@/]+@/, '//***:***@');
            console.log("Connecting to MongoDB:", redacted);
        } catch {
            /* logging must never break the connection */
        }

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        console.log('✅ Connected to MongoDB via Mongoose');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
    }
}
export default connectMongoDB;
