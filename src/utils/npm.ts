import * as ezSpawn from '@jsdevtools/ez-spawn';
import { SemVer } from 'semver';
import { promises as fs } from 'fs';
import { dirname } from 'path';

async function getConfigFile() {
  try {
    const process = await ezSpawn.async('npm', 'config', 'get', 'userconfig');
    return process.stdout.trim();
  } catch (error) {
    throw 'Unable to determine the NPM config file path.';
  }
}

export const setConfig = async () => {
  try {
    const configPath = await getConfigFile();
    const configDirectory = dirname(configPath);
    const config = await fs.readFile(configPath, 'utf-8');
    // Make the directory
    await fs.mkdir(configDirectory, { recursive: true });

    // Write the file
    await fs.writeFile(configPath, '//registry.npmjs.org/:_authToken=${NPM_TOKEN}');
  } catch (error) {
    console.log(error);
  }
};

export const getPublishedVersion = async (name: string): Promise<SemVer> => {
  try {
    const { stdout } = await ezSpawn.async(['npm', 'view', name, 'version']);

    /**
     * The latest version published on NPM
     */
    const currentNpmVersionString = stdout.trim();

    /**
     * Parse/validate the version number
     */
    return new SemVer(currentNpmVersionString);
  } catch (error) {
    if (error && error.toString().includes('E404')) {
      // options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
      return new SemVer('0.0.0');
    }
    return new SemVer('0.0.0');
  }
};

export const publishPackage = async (name: string, version: SemVer) => {
  try {
    await setConfig();
    // throw `Attempted to publish ${name} @${version}`;
    const { stdout } = await ezSpawn.async(['npm', 'publish', '--dry-run']);
  } catch (error) {
    throw error;
  }
};
