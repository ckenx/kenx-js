"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeover = void 0;
var users_1 = __importDefault(require("./users"));
exports.takeover = ['http', 'socketio'];
exports.default = (function (_a, io, models, views) {
    var app = _a.app;
    if (!app)
        return;
    app
        // Decorate application with socket.io server interface
        .decorate('io', io)
        // Decorate application with models
        .decorate('models', models);
    // Decorate application with views
    views && app.decorate('views', views);
    app
        // Register express routes
        .addRouter('/', users_1.default)
        // Handle application exception errors
        .onError(function (error, req, res, next) {
        console.log(error);
        res.status(500).send(error);
    });
});
