"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const messages_1 = __importDefault(require("./routes/messages"));
const public_1 = __importDefault(require("./routes/public"));
const files_1 = __importDefault(require("./routes/files"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
/* ======================
   MIDDLEWARE
====================== */
// ✅ CORS – DEV SAFE (no more port issues)
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json());
/* ======================
   ROUTES
====================== */
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/public', public_1.default);
app.use('/api/files', files_1.default);
/* ======================
   DATABASE
====================== */
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables!');
    process.exit(1);
}
console.log('🔌 Connecting to MongoDB...');
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('✅ MongoDB Connected');
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use!`);
            console.error('💡 Windows: netstat -ano | findstr :5000  then  taskkill /PID <PID> /F');
        }
        else {
            console.error('❌ Server Error:', err);
        }
        process.exit(1);
    });
})
    .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});
/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
    res.status(404).json({ message: 'API Endpoint not found' });
});
