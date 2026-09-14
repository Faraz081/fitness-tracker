import mongoose from 'mongoose';
import { config } from '../backend/src/config/index.js';
import { getDashboardData } from '../backend/src/services/dashboardService.js';

await mongoose.connect(config.MONGO_URI);
const owner = '6a917c6a76b9ec931df01fdf';
const data = await getDashboardData(owner, '2026-09-13');
console.log(JSON.stringify(data, null, 2));
await mongoose.disconnect();