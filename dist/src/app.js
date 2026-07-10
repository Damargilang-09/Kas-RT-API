"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const cors_1 = __importDefault(require("cors"));
const env_config_1 = require("./configs/env.config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_config_1.WHITE_LIST,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RTku API is running",
    });
});
app.use("/api", routes_1.default);
app.use(error_middleware_1.ErrorMiddleware);
if (process.env.NODE_ENV === "development") {
    app.listen(PORT, () => {
        console.log(`[APP] Application is running on port: ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map