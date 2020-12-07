import { debug as log, endGroup, getInput, setFailed, startGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import globby from 'globby';
import { getPublishedVersion } from './utils/npm';
import { readManifest } from './utils/read-manifest';

/**
 * Prints errors to the GitHub Actions console
 */
function errorHandler(error: Error): void {
  const message = error.stack || error.message || String(error);
  setFailed(message);
}

/**
 * Prints debugging messages to the GitHub Actions console
 *
 * @param message debug synopsis
 * @param data optional object of contextually relevant data
 */
function debug(message: string, data?: object): void {
  if (data) {
    startGroup(message);
    log(JSON.stringify(data));
    endGroup();
    return;
  }

  log(message);
  return;
}

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    /**
     * Setup global error handlers
     */
    process.on('uncaughtException', errorHandler);
    process.on('unhandledRejection', errorHandler);

    /**
     * Inputs
     */
    const buildFolder = 'dist';
    const publishCanaryPackages = true;
    const GITHUB_TOKEN = getInput('GITHUB_TOKEN', { required: true });

    /**
     * Log the full context for debugging purposes
     */
    debug('Full Context', context);

    /**
     * Log the available environment variables
     */
    debug('Environment Variables', process.env);

    /**
     * Kill the action if we can't find a repository object in the payload
     */
    if (typeof context.payload.repository === 'undefined') {
      setFailed('Could not find the repository context.');
      return;
    }
    debug('Found a repository object in the payload');

    /**
     * Shorthand aliases for commonly required payload values
     */
    const repo = context.payload.repository.name;
    const owner = context.payload.repository.owner.login;
    const sha = context.payload.after;

    /**
     * Kill the action if the GITHUB_WORKSPACE environment variable is not set
     */
    if (typeof process.env.GITHUB_WORKSPACE === 'undefined') {
      setFailed('GITHUB_WORKSPACE environment variable is not set.');
      return;
    }
    debug('Passed the GITHUB_WORKSPACE environment variable check');

    /**
     * Destructure:
     *  eventName (determines if the trigger type is "push" or "pull_request")
     */
    const { eventName } = context;

    /**
     * Instantiate a GitHub Client instance
     */
    const client = getOctokit(GITHUB_TOKEN);
    debug('Instantiated GitHub Client');

    /**
     * Enforce we're not running the action on every push (unless it's on the default branch)
     */
    if (eventName === 'push') {
      if (context.ref.replace('refs/heads/', '') !== context.payload.repository.default_branch) {
        console.log('Action does not need to trigger on a push to any branches other than the default');
        return;
      }

      /**
       * WE'RE IN THE MAIN BRANCH
       * TODO:
       *
       *  - Check that the version in the package.json manifest is different from what's published on NPM
       *  - If it is, published a new library, if not then exit (successfully?)
       *  - Tag as the latest release on the GitHub Repository
       *  - v<version>
       */
    } else if (eventName === 'pull_request') {
      debug('Running via Pull Request');
      /**
       * If the event type is a pull request we need to make sure that payload context exists
       */
      if (typeof context.payload.pull_request === 'undefined') {
        setFailed('Could not find the pull_request context.');
        return;
      }
      debug('Found a pull_request object in the payload');

      /**
       * Perform Search for all package manifest files in the build folder
       *
       * TODO: perhaps a better name for this?
       * CONTEXT: A project might reasonably have their project root contain the package.json
       */
      debug(`Attempting to search for package.json files in ${process.env.GITHUB_WORKSPACE}/${buildFolder}`);
      const packageManifests = await globby(`${process.env.GITHUB_WORKSPACE}/${buildFolder}`, {
        expandDirectories: {
          files: ['package.json'],
        },
      });
      debug(`Found ${packageManifests.length} package manifests`);

      /**
       * Fail if no package manifests were found
       */
      if (packageManifests.length === 0) {
        setFailed('No package manifests were found');
        return;
      }

      debug('Starting to create status checks for each package that needs to be published');
      await Promise.all(
        packageManifests.map(async (manifest) => {
          debug(`Reading package manifest in ${manifest}`);
          const { name, version } = await readManifest(manifest);
          debug(`Manifest contents`, { name, version });

          debug(`Attempting to create a status check for ${name}`);
          await client.repos.createCommitStatus({
            owner,
            repo,
            sha,
            state: 'pending',
            context: `Publish ${name}`,
            description: `Starting...`,
          });
          debug(`Succesfully created a pending status check for ${name}`);

          try {
            debug(`Attempting to find package on NPM`);
            const { version } = await getPublishedVersion(name);
            debug(`Latest published npm version for ${name} is ${version}`);

            debug(`Attempting to update status check for ${name} to success state`);
            await client.repos.createCommitStatus({
              owner,
              repo,
              sha,
              state: 'success',
              context: `Publish ${name}`,
              description: `Published v${version}!`,
            });
            debug(`Succesfully updated status check for ${name}`);
          } catch (error) {
            const message = error ? error.message : 'Something went wrong';
            debug('Publishing Error Message', { message });

            debug(`Attempting to update status check for ${name} to error state`);
            await client.repos.createCommitStatus({
              owner,
              repo,
              sha,
              state: 'error',
              context: `Publish ${name}`,
              // description: message,
              description: 'Failed to publish',
            });
            debug(`Succesfully updated status check for ${name}`);
          }
        })
      );

      /**
       * TODO:
       *
       * - If we're in a release branch publish to NPM as a release candidate package, publish to the `next` npm dist tag
       * - <version>-rc.<sha>
       */
    }

    /**
     * TODO:
     *
     * - Add an optional flag to (maybe) fallback to publishing a canary package.
     * - 0.0.0-<sha>
     */

    /**
     * The current HEAD (source) branch for the PR
     */
    // const currentBranch: string = context.payload.pull_request.head.ref;

    /**
     * The target BASE branch for the PR
     */
    // const targetBranch: string = context.payload.pull_request.base.ref;

    /**
     * The main DEFAULT branch for the codebase
     */
    // const defaultBranch: string = context.payload.repository.default_branch;

    /**
     * If the target branch matches the repository default.
     * Should that be the case, we're tagging it as a release candidate
     */
    // if (targetBranch === defaultBranch) {
    //   // releaseCandidate = true;
    //   startGroup('[REMOVE] Full Context Object');
    //   console.log(`[RELEASE CANDIDATE]:`, true);
    //   endGroup();
    // }

    throw new Error('Throw works!');
  } catch (error) {
    errorHandler(error as Error);
  }
}

run();
