export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'THIS SHOULD BE OVERRIDDEN BY A VALUE IN THE .ENV FILE. ALWAYS OVERRIDE THIS VALUE IN PRODUCTION.',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost/revi',
    jwtExpiration: '1d',
    mail_user: process.env.MAIL_USER,
    mail_password: process.env.MAIL_PASSWORD,
    def_mail_from: process.env.DEFAULT_MAIL_FROM,
    app_name: process.env.APP_NAME
});