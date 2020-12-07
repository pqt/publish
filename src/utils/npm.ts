import * as ezSpawn from '@jsdevtools/ez-spawn';
import { SemVer } from 'semver';

export const getPublishedVersion = async (name: string) => {
  const { stdout, stderr } = await ezSpawn.async(['npm', 'view', name, 'version']);
  if (stderr && stderr.includes('E404')) {
    // options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
    return new SemVer('0.0.0');
  }

  /**
   * The latest version published on NPM
   */
  const currentNpmVersionString = stdout.trim();

  /**
   * Parse/validate the version number
   */
  return new SemVer(currentNpmVersionString);
};
