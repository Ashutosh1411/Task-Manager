"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const projects_1 = __importDefault(require("./routes/projects"));
const audit_1 = __importDefault(require("./routes/audit"));
const nlp_1 = __importDefault(require("./routes/nlp"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/tasks", tasks_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/audit", audit_1.default);
app.use("/api/nlp", nlp_1.default);
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
