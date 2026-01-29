"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        // Allow preflight requests to pass through without auth
        if (req.method === 'OPTIONS') {
            return next();
        }
        // Be tolerant of different header casings and formats
        const rawHeader = (req.headers['authorization'] ||
            req.headers.Authorization);
        if (!rawHeader) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        // Accept both "Bearer <token>" and raw token strings
        const token = rawHeader.startsWith('Bearer ')
            ? rawHeader.substring('Bearer '.length).trim()
            : rawHeader.trim();
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'osf_secret_key_2025');
        const user = await User_1.default.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'User unauthorized or deactivated' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Session expired. Please login again.' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access restricted to ' + roles.join(' or ') });
        }
        next();
    };
};
exports.authorize = authorize;
