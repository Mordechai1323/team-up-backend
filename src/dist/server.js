"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const path = require('path');
const http = require('http');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const credentials = require('./middlewares/credentials');
const connectDB = require('./config/dbConnect');
let port = process.env.PORT || 3002;
connectDB();
app.use(credentials);
app.use(cors(corsOptions));
app.use(express_1.default.json());
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.send('fdsgdhjm');
});
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/users', require('./routes/api/users'));
app.use('/boards', require('./routes/api/boards'));
app.use('/groups', require('./routes/api/groups'));
app.use('/tasks', require('./routes/api/tasks'));
app.use('/teams', require('./routes/api/teams'));
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`server run on port ${port}`);
});
