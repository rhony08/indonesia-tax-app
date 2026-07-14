export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    provider: process.env.DATABASE_PROVIDER ?? 'sqlite',
    url: process.env.DATABASE_URL ?? './data/tax-app.db',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiration: process.env.JWT_EXPIRATION ?? '24h',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ??
      'http://localhost:3000/api/v1/auth/google/callback',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
    merchantId: process.env.MIDTRANS_MERCHANT_ID ?? '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
