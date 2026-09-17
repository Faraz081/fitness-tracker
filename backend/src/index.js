import dns from 'node:dns';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { MONGO_DNS_SERVERS, MONGO_URI, PORT } from './config/index.js';
import { backfillWorkoutCompletionStatus } from './services/notificationService.js';
if (MONGO_DNS_SERVERS?.length) {
    dns.setServers(MONGO_DNS_SERVERS);
}
const connectToMongo = async () => {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 10_000,
                connectTimeoutMS: 10_000,
            });
            return;
        }
        catch (error) {
            lastError = error;
            if (attempt < 3) {
                console.warn(`MongoDB connection attempt ${attempt} failed; retrying...`);
            }
        }
    }
    throw lastError;
};
async function main() {
    await connectToMongo();
    console.log('Connected to MongoDB');
    try {
        const backfilled = await backfillWorkoutCompletionStatus();
        if (backfilled > 0) {
            console.log(`Marked ${backfilled} legacy workout(s) as completed from existing notifications`);
        }
    }
    catch (error) {
        console.warn('Legacy workout completion backfill skipped:', error instanceof Error ? error.message : error);
    }
    const app = createApp();
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}
main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to start server:', message);
    if (message.includes('Could not connect to any servers') || message.includes('IP that isn\'t whitelisted')) {
        console.error('MongoDB Atlas rejected this machine. Add its public IP in Atlas Security > Network Access.');
    }
    else if (message.includes('querySrv') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
        console.error('MongoDB DNS/network access failed. Check DNS/VPN/firewall and the Atlas cluster hostname.');
    }
    else if (message.includes('authentication failed')) {
        console.error('MongoDB authentication failed. Check the database username and password in backend/.env.');
    }
    else if (message.includes('Server selection timed out')) {
        console.error('MongoDB server selection timed out. Add this machine IP to MongoDB Atlas Network Access.');
    }
    process.exit(1);
});
