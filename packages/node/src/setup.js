"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yaml_1 = __importDefault(require("yaml"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var shelljs_1 = require("shelljs");
var tsc = __importStar(require("tsc-prog"));
var node_path_1 = __importDefault(require("node:path"));
var context_1 = __importDefault(require("#lib/context"));
var Setup = /** @class */ (function () {
    function Setup() {
        // Defined setup context
        this.context = new context_1.default('setup');
        this.REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i;
        this.PLUGIN_NAME_MATCH_REGEX = /(@?[a-zA-Z0-9-_.]+)\/?([a-zA-Z0-9-_.]+)?/i;
        this.Plugins = [];
        this.Path = node_path_1.default;
        this.Fs = fs_extra_1.default;
    }
    Setup.prototype.parseYaml = function (filepath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, _a, _b, _i, _c, each, _d, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        _b = (_a = yaml_1.default).parse;
                        return [4 /*yield*/, this.Fs.readFile("".concat(filepath, ".yml"), 'utf-8')];
                    case 1:
                        content = _b.apply(_a, [_e.sent()]);
                        if (!content.__extends__) return [3 /*break*/, 5];
                        _i = 0, _c = content.__extends__;
                        _e.label = 2;
                    case 2:
                        if (!(_i < _c.length)) return [3 /*break*/, 5];
                        each = _c[_i];
                        _d = [__assign({}, content)];
                        return [4 /*yield*/, this.parseYaml("".concat(this.Path.dirname(filepath), "/").concat(each))];
                    case 3:
                        content = __assign.apply(void 0, _d.concat([(_e.sent())]));
                        delete content.__extends__;
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, content];
                    case 6:
                        error_1 = _e.sent();
                        this.context.log("Parsing <".concat(filepath, ".yml> file:"), error_1);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Setup.prototype.comply = function (value) {
        var _this = this;
        if (!value)
            return value;
        switch (typeof value) {
            case 'string': return this.REFERENCE_MATCH_REGEX.test(value) ? this.comply(this.resolveReference(value)) : value;
            case 'number': return value;
            default: {
                if (Array.isArray(value))
                    return value.map(function (each) { return _this.comply(each); });
                Object
                    .entries(value)
                    .map(function (_a) {
                    var key = _a[0], subValue = _a[1];
                    /**
                     * Auto-collect plugin dependencies from
                     * the configuration, to be install before
                     * project build or run.
                     */
                    key == 'plugin'
                        && typeof subValue == 'string'
                        && !_this.Plugins.includes(subValue)
                        && _this.Plugins.push(subValue);
                    // Resolve references
                    value[key] = _this.comply(subValue);
                });
                return value;
            }
        }
    };
    Setup.prototype.initialize = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, packageJson_1, deps, _c, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this;
                        return [4 /*yield*/, this.loadConfig('index')];
                    case 1:
                        _b.Config = _d.sent();
                        if (!this.Config) {
                            this.context.error('Setup configuration not found');
                            process.exit(1);
                        }
                        /**
                         * Comply data by resolving all key references
                         * throughout partials configurations
                         */
                        this.comply(this.Config);
                        /**
                         * Define project directory structure
                         * and pattern
                         */
                        this.Config.directory = this.Config.directory || {};
                        this.Config.directory.base = this.Path.resolve(process.cwd(), this.Config.directory.base || '/');
                        this.Config.directory.pattern = this.Config.directory.pattern || '-';
                        /**
                         * Wheter come next is only for development
                         * mode environment.
                         *
                         * It assumes all dependencies and builds are
                         * created before production deployment.
                         */
                        if (process.env.NODE_ENV === 'production')
                            return [2 /*return*/];
                        if (!this.Plugins.length) return [3 /*break*/, 7];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        console.log('Installing dependency plugins ...');
                        return [4 /*yield*/, this.Fs.readJSON('package.json')];
                    case 3:
                        packageJson_1 = _d.sent();
                        if (!packageJson_1)
                            throw new Error('Project package.json file not found');
                        deps = this.Plugins.filter(function (each) { return !packageJson_1.dependencies[each]; });
                        _c = deps.length;
                        if (!_c) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, shelljs_1.exec)("npm install ".concat(deps.join(' ')))];
                    case 4:
                        _c = (_d.sent());
                        _d.label = 5;
                    case 5:
                        _c;
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _d.sent();
                        console.error(error_2);
                        process.exit(1);
                        return [3 /*break*/, 7];
                    case 7:
                        /**
                         * Automatically build typscript project
                         *
                         * Note: Must set `typescript` in `.config/index.yml`
                         *       to true. Also add `tsconfig.json` to your
                         *       project's root.
                         *
                         * TODO: Set up hot reload
                         */
                        if ((_a = this.Config) === null || _a === void 0 ? void 0 : _a.typescript)
                            try {
                                tsc.build({
                                    basePath: process.cwd(),
                                    configFilePath: 'tsconfig.json', // Inherited config (optional)
                                    clean: {
                                        outDir: true,
                                        declarationDir: true
                                    },
                                    compilerOptions: {
                                        rootDir: 'src',
                                        outDir: 'dist',
                                        declaration: true,
                                        skipLibCheck: true,
                                    },
                                    include: ['src/**/*'],
                                    exclude: ['**/*.test.ts', '**/*.spec.ts'],
                                });
                            }
                            catch (error) {
                                console.error(error);
                                process.exit(1);
                            }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load setup configurations
     */
    Setup.prototype.loadConfig = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.parseYaml("".concat(process.cwd(), "/.config/").concat(target))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.context.log("<".concat(target, "> target: %o"), error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Return setup configurations
     */
    Setup.prototype.getConfig = function (key) {
        if (!this.Config)
            throw new Error('No setup configuration found');
        return key ? this.Config[key] : this.Config;
    };
    /**
     * Import module
     */
    Setup.prototype.importModule = function (path, throwError) {
        var _a;
        if (throwError === void 0) { throwError = false; }
        return __awaiter(this, void 0, void 0, function () {
            var module, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.Config)
                            throw new Error('No setup configuration found');
                        if (!path)
                            throw new Error('Undefined module path');
                        path = ((_a = this.Config) === null || _a === void 0 ? void 0 : _a.typescript) ?
                            // Typescript build folder
                            this.Path.join("".concat(process.cwd(), "/dist"), path)
                            // Specified project directory base
                            : this.Path.join(this.Config.directory.base, path);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve("".concat(path)).then(function (s) { return __importStar(require(s)); })];
                    case 2:
                        module = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        throwError && console.log("import <".concat(path, "> failed: "), error_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, module];
                }
            });
        });
    };
    /**
     * Import plugin
     */
    Setup.prototype.importPlugin = function (refname) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, error_5, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.Config)
                            throw new Error('No setup configuration found');
                        if (!refname)
                            throw new Error('Undefined plugin name');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.importModule("/plugins/".concat(refname))];
                    case 2:
                        plugin = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!!plugin) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve("".concat(refname)).then(function (s) { return __importStar(require(s)); })];
                    case 6:
                        plugin = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        if (!(plugin === null || plugin === void 0 ? void 0 : plugin.default))
                            throw new Error("<".concat(refname, "> plugin not found"));
                        return [2 /*return*/, plugin.default];
                }
            });
        });
    };
    /**
     * Resolve setup reference
     */
    Setup.prototype.resolveReference = function (reference) {
        if (!this.Config || typeof this.Config !== 'object')
            throw new Error('No setup configuration found');
        var _a = reference.match(this.REFERENCE_MATCH_REGEX) || [], _ = _a[0], section = _a[1], key = _a[2];
        if (!_ || !key || !section)
            return;
        // Refer to defined environment variables
        if (section === 'env')
            return process.env[key];
        // Multi-configurations array
        else if (Array.isArray(this.Config[section])) {
            for (var _i = 0, _b = this.Config[section]; _i < _b.length; _i++) {
                var config = _b[_i];
                if ((!config.key && key == 'default') || config.key == key)
                    return config;
            }
        }
        // Consise object
        else
            return this.Config[section] ? this.Config[section][key] : undefined;
    };
    /**
     * Resolve path with specified project
     * directory root as dirname
     */
    Setup.prototype.resolvePath = function (path) {
        var _a;
        if (!this.Config || typeof this.Config !== 'object')
            throw new Error('No setup configuration found');
        return this.Path.resolve((_a = this.Config) === null || _a === void 0 ? void 0 : _a.directory.base, path);
    };
    return Setup;
}());
exports.default = Setup;
