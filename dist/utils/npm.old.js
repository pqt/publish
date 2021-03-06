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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPackage = exports.getPublishedVersion = exports.setConfig = void 0;
const ezSpawn = __importStar(require("@jsdevtools/ez-spawn"));
const semver_1 = require("semver");
const fs_1 = require("fs");
const path_1 = require("path");
function getConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const process = yield ezSpawn.async('npm', 'config', 'get', 'userconfig');
            return process.stdout.trim();
        }
        catch (error) {
            throw 'Unable to determine the NPM config file path.';
        }
    });
}
const setConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configPath = yield getConfigFile();
        const configDirectory = path_1.dirname(configPath);
        const config = yield fs_1.promises.readFile(configPath, 'utf-8');
        // Make the directory
        yield fs_1.promises.mkdir(configDirectory, { recursive: true });
        // Write the file
        yield fs_1.promises.writeFile(configPath, '//registry.npmjs.org/:_authToken=${NPM_TOKEN}');
    }
    catch (error) {
        console.log(error);
    }
});
exports.setConfig = setConfig;
const getPublishedVersion = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout } = yield ezSpawn.async(['npm', 'view', name, 'version']);
        /**
         * The latest version published on NPM
         */
        const currentNpmVersionString = stdout.trim();
        /**
         * Parse/validate the version number
         */
        return new semver_1.SemVer(currentNpmVersionString);
    }
    catch (error) {
        if (error && error.toString().includes('E404')) {
            // options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
            return new semver_1.SemVer('0.0.0');
        }
        return new semver_1.SemVer('0.0.0');
    }
});
exports.getPublishedVersion = getPublishedVersion;
const publishPackage = (name, version) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.setConfig();
        // throw `Attempted to publish ${name} @${version}`;
        const { stdout } = yield ezSpawn.async(['npm', 'publish', '--dry-run']);
    }
    catch (error) {
        throw error;
    }
});
exports.publishPackage = publishPackage;
