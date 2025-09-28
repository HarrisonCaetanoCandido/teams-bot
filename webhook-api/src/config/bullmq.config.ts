import dotenv from 'dotenv'
dotenv.config();

export const connection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '63719'),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
};