import * as ezSpawn from '@jsdevtools/ez-spawn';
import { SemVer } from 'semver';

export const setConfig = async () => {
  const process = await ezSpawn.async('npm', 'config', 'get', 'userconfig');
  console.log(process.stdout.trim());
  // return process.stdout.trim();
  // registry.npmjs.org/:_authToken=${NPM_TOKEN}
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
    console.log(error);
    if (error && error.includes('E404')) {
      // options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
      return new SemVer('0.0.0');
    }
    return new SemVer('0.0.0');
  }
};

export const publishPackage = async (name: string, version: SemVer) => {
  try {
    await setConfig();
    // const { stdout } = await ezSpawn.async(['npm', 'publish']);
  } catch (error) {
    console.log(error);
  }
};
