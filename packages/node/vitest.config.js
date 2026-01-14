"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("vitest/config");
var path_1 = __importDefault(require("path"));
exports.default = (0, config_1.defineConfig)({
    resolve: {
        alias: {
            '#types': path_1.default.resolve(__dirname, './src/types'),
            '#lib': path_1.default.resolve(__dirname, './src/lib'),
            '#root': path_1.default.resolve(__dirname, './src')
        }
    },
    test: {
        name: '@ckenx/node',
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'dist/**', 'temp/**']
        }
    }
});
