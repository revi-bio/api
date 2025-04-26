export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret:
    process.env.JWT_SECRET ||
    'THIS SHOULD BE OVERRIDDEN BY A VALUE IN THE .ENV FILE. ALWAYS OVERRIDE THIS VALUE IN PRODUCTION.',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost/revi',
  jwtExpiration: '1d',

  mailHost: process.env.MAIL_HOST || 'localhost',
  mailPort: process.env.MAIL_PORT || 25,
  mailSecure: process.env.MAIL_SECURE || false,
  mailUser: process.env.MAIL_USER || '',
  mailPassword: process.env.MAIL_PASSWORD || '',
  defMailFrom: process.env.DEFAULT_MAIL_FROM || 'revi.bio',
  appName: process.env.APP_NAME || 'noreply@revibio.app',
  frontendRoot: process.env.FRONTEND_ROOT || 'revibio.app'
});
