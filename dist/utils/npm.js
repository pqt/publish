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
exports.publish = exports.readManifest = void 0;
const ez_spawn_1 = __importDefault(require("@jsdevtools/ez-spawn"));
const fs_1 = require("fs");
const semver_1 = require("semver");
const path_1 = require("path");
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
 * Read the `.npmrc` file.
 */
// export async function readConfig(path: string) {
//   try {
//   } catch (error) {
//     throw error;
//   }
// }
/**
 * Update the `.npmrc` file contents for the GitHub Action
 */
// export async function updateConfig(path: string, registry: URL) {
//   try {
//   } catch (error) {
//     throw error;
//   }
// }
/**
 * Publish a new version of a package to the registry
 */
function publish(path) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ez_spawn_1.default.async(['npm', 'publish', '--dry-run'], { cwd: path_1.resolve(path_1.dirname(path)) });
        // try {
        // } catch (error) {
        //   throw error;
        // }
    });
}
exports.publish = publish;
