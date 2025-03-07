export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'THIS SHOULD BE OVERRIDDEN BY A VALUE IN THE .ENV FILE. ALWAYS OVERRIDE THIS VALUE IN PRODUCTION.',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost/revi',
    jwtExpiration: '1d',
});