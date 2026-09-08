import 'dotenv/config';
const asNumber = (value, fallback, name) => {
    if (value === undefined || value === '')
        return fallback;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number`);
    }
    return parsed;
};
const requireEnv = (name, value) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const PORT = asNumber(process.env.PORT, 5000, 'PORT');
export const MONGO_URI = requireEnv('MONGO_URI', process.env.MONGO_URI);
export const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);
export const JWT_SECRET = requireEnv('JWT_SECRET', process.env.JWT_SECRET);
export const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '1h';
export const CLIENT_ORIGIN = requireEnv('CLIENT_ORIGIN', process.env.CLIENT_ORIGIN);
export const BCRYPT_ROUNDS = asNumber(process.env.BCRYPT_ROUNDS, 10, 'BCRYPT_ROUNDS');
export const COOKIE_NAME = process.env.COOKIE_NAME ?? 'access_token';
if (JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
}
if (BCRYPT_ROUNDS < 10) {
    throw new Error('BCRYPT_ROUNDS must be >= 10 (constitution: salt rounds >= 10)');
}
const UNIT_MS = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
};
export const jwtExpiryMs = () => {
    const match = /^(\d+)([smhd])$/.exec(JWT_EXPIRES);
    if (!match)
        return 3_600_000;
    return Number(match[1]) * (UNIT_MS[match[2]] ?? 3_600_000);
};
