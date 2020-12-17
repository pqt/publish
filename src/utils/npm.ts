import ezSpawn from '@jsdevtools/ez-spawn';
import { promises as fs } from 'fs';
import { SemVer } from 'semver';
import { dirname, resolve } from 'path';

/**
 * Retrieve the absolute path for the `.npmrc` file.
 *
 * IE: /home/runner/.npmrc
 */
// export async function getConfigFile() {
//   try {
//   } catch (error) {
//     throw error;
//   }
// }

/**
 * Retrieve the latest published version of a package from the registry.
 * If no package is published, a version of 0.0.0 will be returned.
 */
// export async function getLatestVersion(name: string) {
//   try {
//   } catch (error) {
//     throw error;
//   }
// }

interface Manifest {
  name: string;
  version: SemVer;
}

/**
 * Read package manifest
 */
export async function readManifest(path: string) {
  let json: string;

  try {
    json = await fs.readFile(path, 'utf-8');
  } catch (error) {
    throw `Unable to read ${path}`;
  }

  try {
    const { name, version } = JSON.parse(json) as Record<string, unknown>;

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new TypeError('Invalid package name');
    }

    const manifest: Manifest = {
      name,
      version: new SemVer(version as string),
    };

    // debug && debug("MANIFEST:", manifest);
    return manifest;
  } catch (error) {
    // throw ono(error, `Unable to parse ${path}`);
    throw `Unable to parse ${path}`;
  }
}

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
export async function publish(path: string) {
  return await ezSpawn.async(['npm', 'publish', '--dry-run'], { cwd: resolve(dirname(path)) });
  // try {
  // } catch (error) {
  //   throw error;
  // }
}
