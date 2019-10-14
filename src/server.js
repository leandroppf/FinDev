require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const io = require('socket.io');
const cors = require('cors');
const databaseConfig = require('./config/database');
const server = require('http');

const connectedUsers = {};

class App{
    constructor(){
        this.express = express();
        this.isDev = process.env.NODE_ENV !== 'production'

        this.server = require('http').Server(this.express);
        this.io = require('socket.io')(this.server);

        this.ioExec();
        this.database();
        this.middlewares();
        this.routes();
    }

    ioExec(){
        this.io.on('connection', socket => {
            const { user } = socket.handshake.query;

            connectedUsers[user] = socket.id;
        });
    }

    database(){
        mongoose.connect(databaseConfig.uri, {
            useNewUrlParser: true,
            useCreateIndex: true
        });
    }

    middlewares(){
        this.express.use((req, res, next) => {
            req.io = this.io;
            req.connectedUsers = connectedUsers;

            return next();
        });

        this.express.use(cors());
        this.express.use(express.json());
    }

    routes(){
        this.express.use(require('./routes'));
    }
}

module.exports = new App().server;