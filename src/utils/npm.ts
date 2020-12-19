import ezSpawn from '@jsdevtools/ez-spawn';
import { promises as fs } from 'fs';
import { SemVer } from 'semver';
import { dirname, resolve } from 'path';
import { EOL } from 'os';

/**
 * Retrieve the absolute path for the `.npmrc` file.
 *
 * IE: /home/runner/.npmrc
 */
export async function getConfigFile() {
  console.log('Start getConfigFile Function');
  const process = await ezSpawn.async('npm', 'config', 'get', 'userconfig');
  console.log('Config Location:');
  console.log(process.stdout.trim());
  return process.stdout.trim();
}

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
  console.log('Start readManifest Function');
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
    console.log(JSON.stringify(manifest));
    return manifest;
  } catch (error) {
    // throw ono(error, `Unable to parse ${path}`);
    throw `Unable to parse ${path}`;
  }
}

/**
 * Update the package manifest version
 */
export async function updateManifest(path: string, version: SemVer) {
  console.log('Start updateManifest Function');
  const config = await readManifest(path);
  const newConfig = JSON.stringify({ name: config.name, version: version.version });
  await fs.writeFile(path, newConfig);
  console.log(JSON.stringify(await readManifest(path)));
}

/**
 * Read the `.npmrc` file.
 */
export async function readConfigFile(path: string) {
  console.log('Start readConfigFile Function');
  try {
    // debug(`Reading NPM config from ${configPath}`);

    const config = await fs.readFile(path, 'utf-8');

    // debug(`OLD NPM CONFIG: \n${config}`);
    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // debug("OLD NPM CONFIG: <none>");
      return '';
    }

    throw `Unable to read the NPM config file: ${path}`;
  }
}

/**
 * Update the `.npmrc` file contents for the GitHub Action
 */
export async function updateConfigFile(path: string, registry: URL = new URL('https://registry.npmjs.org/')) {
  console.log('Start updateConfigFile Function');
  let config = await readConfigFile(path);

  const configPath = dirname(path);
  const authDomain = registry.origin.slice(registry.protocol.length);

  let lines = config.split(/\r?\n/);

  // Remove any existing lines that set the registry or token
  lines = lines.filter((line) => !(line.startsWith('registry=') || line.includes('_authToken=')));

  // Append the new registry and token to the end of the file
  lines.push(`${authDomain}/:_authToken=\${INPUT_TOKEN}`);
  lines.push(`registry=${registry.href}`);

  config = lines.join(EOL).trim() + EOL;

  await fs.mkdir(dirname(configPath), { recursive: true });
  await fs.writeFile(path, config);
}

/**
 * Publish a new version of a package to the registry
 */
export async function publish(path: string, version: SemVer) {
  console.log('Start publish Function');
  await updateManifest(path, version);
  const command = [
    'npm',
    'publish',
    '--tag canary',
    '--access public',
    // '--dry-run'
  ];
  const publish = await ezSpawn.async(command, { cwd: resolve(dirname(path)) });
  console.log(publish);
  return publish;
}
