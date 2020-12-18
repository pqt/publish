"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = exports.updateConfigFile = exports.readConfigFile = exports.updateManifest = exports.readManifest = exports.getConfigFile = void 0;
const ez_spawn_1 = __importDefault(require("@jsdevtools/ez-spawn"));
const fs_1 = require("fs");
const semver_1 = require("semver");
const path_1 = require("path");
const os_1 = require("os");
/**
 * Retrieve the absolute path for the `.npmrc` file.
 *
 * IE: /home/runner/.npmrc
 */
function getConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const process = yield ez_spawn_1.default.async('npm', 'config', 'get', 'userconfig');
        return process.stdout.trim();
    });
}
exports.getConfigFile = getConfigFile;
/**
 * Read package manifest
 */
function readManifest(path) {
    return __awaiter(this, void 0, void 0, function* () {
        let json;
        try {
            json = yield fs_1.promises.readFile(path, 'utf-8');
        }
        catch (error) {
            throw `Unable to read ${path}`;
        }
        try {
            const { name, version } = JSON.parse(json);
            if (typeof name !== 'string' || name.trim().length === 0) {
                throw new TypeError('Invalid package name');
            }
            const manifest = {
                name,
                version: new semver_1.SemVer(version),
            };
            // debug && debug("MANIFEST:", manifest);
            return manifest;
        }
        catch (error) {
            // throw ono(error, `Unable to parse ${path}`);
            throw `Unable to parse ${path}`;
        }
    });
}
exports.readManifest = readManifest;
/**
 * Update the package manifest version
 */
function updateManifest(path, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield readManifest(path);
        const newConfig = JSON.stringify({ name: config.name, version: version.version });
        yield fs_1.promises.writeFile(path, newConfig);
    });
}
exports.updateManifest = updateManifest;
/**
 * Read the `.npmrc` file.
 */
function readConfigFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // debug(`Reading NPM config from ${configPath}`);
            const config = yield fs_1.promises.readFile(path, 'utf-8');
            // debug(`OLD NPM CONFIG: \n${config}`);
            return config;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // debug("OLD NPM CONFIG: <none>");
                return '';
            }
            throw `Unable to read the NPM config file: ${path}`;
        }
    });
}
exports.readConfigFile = readConfigFile;
/**
 * Update the `.npmrc` file contents for the GitHub Action
 */
function updateConfigFile(path, registry = new URL('https://registry.npmjs.org/')) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield readConfigFile(path);
        const configPath = path_1.dirname(path);
        const authDomain = registry.origin.slice(registry.protocol.length);
        let lines = config.split(/\r?\n/);
        // Remove any existing lines that set the registry or token
        lines = lines.filter((line) => !(line.startsWith('registry=') || line.includes('_authToken=')));
        // Append the new registry and token to the end of the file
        lines.push(`${authDomain}/:_authToken=\${INPUT_TOKEN}`);
        lines.push(`registry=${registry.href}`);
        config = lines.join(os_1.EOL).trim() + os_1.EOL;
        yield fs_1.promises.mkdir(path_1.dirname(configPath), { recursive: true });
        yield fs_1.promises.writeFile(path, config);
    });
}
exports.updateConfigFile = updateConfigFile;
/**
 * Publish a new version of a package to the registry
 */
function publish(path, version) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateManifest(path, version);
        const command = [
            'npm',
            'publish',
            '--access=public',
        ];
        return yield ez_spawn_1.default.async(command, { cwd: path_1.resolve(path_1.dirname(path)) });
    });
}
exports.publish = publish;
