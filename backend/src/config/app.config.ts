// src/config/app.config.ts
export default () => ({
    port: parseInt(process.env.DATABASE_URL, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    mail: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        from: process.env.MAIL_FROM,
    },
    clientUrl: process.env.CLIENT_URL, // e.g. https://your-frontend.app
});
