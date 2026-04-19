import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Email from './models/Email.js';

dotenv.config();

const clear = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB successfully!');
        const res = await Email.deleteMany({});
        console.log(`Deleted ${res.deletedCount} old email records.`);
        process.exit(0);
    } catch (e) {
        console.error('Error clearing DB:', e);
        process.exit(1);
    }
};

clear();
