"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
const typedi_1 = __importDefault(require("typedi"));
const open_1 = __importDefault(require("../services/open"));
const express_urlrewrite_1 = __importDefault(require("express-urlrewrite"));
exports.default = ({ app }) => {
    app.enable('trust proxy');
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    app.use((0, express_jwt_1.default)({ secret: config_1.default.secret, algorithms: ['HS384'] }).unless({
        path: [
            '/api/login',
            '/api/crons/status',
            /^\/open\//,
            '/api/user/two-factor/login',
        ],
    }));
    app.use(async (req, res, next) => {
        const headerToken = (0, util_1.getToken)(req);
        if (req.path.startsWith('/open/')) {
            const openService = typedi_1.default.get(open_1.default);
            const doc = await openService.findTokenByValue(headerToken);
            if (doc && doc.tokens.length > 0) {
                const currentToken = doc.tokens.find((x) => x.value === headerToken);
                const key = req.path.match(/\/open\/([a-z]+)\/*/) &&
                    req.path.match(/\/open\/([a-z]+)\/*/)[1];
                if (doc.scopes.includes(key) &&
                    currentToken &&
                    currentToken.expiration >= Math.round(Date.now() / 1000)) {
                    return next();
                }
            }
        }
        if (!headerToken &&
            req.path &&
            (req.path === '/api/login' ||
                req.path === '/open/auth/token' ||
                req.path === '/api/user/two-factor/login')) {
            return next();
        }
        const remoteAddress = req.socket.remoteAddress;
        if (remoteAddress === '::ffff:127.0.0.1' &&
            req.path === '/api/crons/status') {
            return next();
        }
        const data = fs_1.default.readFileSync(config_1.default.authConfigFile, 'utf8');
        if (data) {
            const { token } = JSON.parse(data);
            if (token && headerToken === token) {
                return next();
            }
        }
        const err = new Error('UnauthorizedError');
        err.status = 401;
        next(err);
    });
    app.use((0, express_urlrewrite_1.default)('/open/*', '/api/$1'));
    app.use(config_1.default.api.prefix, (0, api_1.default)());
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            return res
                .status(err.status)
                .send({ code: 401, message: err.message })
                .end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            code: err.status || 500,
            message: err.message,
        });
    });
};
//# sourceMappingURL=express.js.map