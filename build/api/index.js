"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const env_1 = __importDefault(require("./env"));
const config_1 = __importDefault(require("./config"));
const log_1 = __importDefault(require("./log"));
const cron_1 = __importDefault(require("./cron"));
const script_1 = __importDefault(require("./script"));
const open_1 = __importDefault(require("./open"));
exports.default = () => {
    const app = (0, express_1.Router)();
    (0, auth_1.default)(app);
    (0, env_1.default)(app);
    (0, config_1.default)(app);
    (0, log_1.default)(app);
    (0, cron_1.default)(app);
    (0, script_1.default)(app);
    (0, open_1.default)(app);
    return app;
};
//# sourceMappingURL=index.js.map