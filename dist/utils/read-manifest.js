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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readManifest = void 0;
const fs_1 = require("fs");
const semver_1 = require("semver");
/**
 * Reads the package manifest (package.json) and returns its parsed contents
 * @internal
 */
function readManifest(path) {
    return __awaiter(this, void 0, void 0, function* () {
        // debug && debug(`Reading package manifest from ${resolve(path)}`);
        let json;
        try {
            json = yield fs_1.promises.readFile(path, 'utf-8');
        }
        catch (error) {
            throw `Unable to read ${path}`;
            // throw ono(error, `Unable to read ${path}`);
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
