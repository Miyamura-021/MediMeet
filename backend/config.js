import 'dotenv/config';

export default {
    port: process.env.PORT || 5000,
    db: process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_booking',
    jwtSecret: process.env.JWT_SECRET || 'vndjndsvjnsdkvnsdk879njkcs',
    jwtExpiration: process.env.JWT_EXPIRATION || '7d',
}