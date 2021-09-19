"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("../config"));
const auth_1 = __importDefault(require("../services/auth"));
const celebrate_1 = require("celebrate");
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/', route);
    route.post('/login', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.login(Object.assign({}, req.body), req);
            return res.send(data);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/logout', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            fs.readFile(config_1.default.authConfigFile, 'utf8', function (err, data) {
                if (err)
                    console.log(err);
                const authInfo = JSON.parse(data);
                fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify(Object.assign(Object.assign({}, authInfo), { token: '' })));
                res.send({ code: 200 });
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/user', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const content = fs.readFileSync(config_1.default.authConfigFile, 'utf8');
            fs.writeFile(config_1.default.authConfigFile, JSON.stringify(Object.assign(Object.assign({}, JSON.parse(content || '{}')), req.body)), (err) => {
                if (err)
                    console.log(err);
                res.send({ code: 200, message: '更新成功' });
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const authInfo = await authService.getUserInfo();
            res.send({
                code: 200,
                data: {
                    username: authInfo.username,
                    twoFactorActivated: authInfo.twoFactorActivated,
                },
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user/two-factor/init', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.initTwoFactor();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/user/two-factor/active', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            code: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.activeTwoFactor(req.body.code);
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/user/two-factor/deactive', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.deactiveTwoFactor();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/user/two-factor/login', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            code: celebrate_1.Joi.string().required(),
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.twoFactorLogin(req.body, req);
            res.send(data);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user/login-log', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.getLoginLog();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user/notification', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const data = await authService.getNotificationMode();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/user/notification', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const authService = typedi_1.Container.get(auth_1.default);
            const result = await authService.updateNotificationMode(req.body);
            res.send(result);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=auth.js.map