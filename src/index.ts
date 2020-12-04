import { endGroup, getInput, setFailed, startGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import globby from 'globby';
import fetch from 'node-fetch';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    /**
     * Log the full context for debugging purposes
     * TODO: Move to debugging ONLY before production
     */
    startGroup('[REMOVE] Full Context Object');
    console.log(JSON.stringify(context));
    endGroup();

    /**
     * Log the available environment variables
     * TODO: Move to debugging ONLY before production
     */
    startGroup('[REMOVE] Environment Variables');
    console.log(JSON.stringify(process.env));
    endGroup();

    /**
     * Kill the action if we can't find a repository in the payload
     */
    if (typeof context.payload.repository === 'undefined') {
      setFailed('Could not find the repository context.');
      return;
    }

    /**
     * Kill the action if the GITHUB_WORKSPACE environment variable is not set
     */
    if (typeof process.env.GITHUB_WORKSPACE === 'undefined') {
      setFailed('GITHUB_WORKSPACE environment variable is not set.');
      return;
    }

    /**
     * Destructure:
     *  eventName (determines if the trigger type is "push" or "pull_request")
     */
    const { eventName } = context;

    /**
     * Status Check URL
     */
    // const statusCheckUrl = `https://api.github.com/repos/${context.payload.repository.full_name}/statuses/${sha}`;

    /**
     * Instantiate a GitHub Client instance
     */
    const token = getInput('GITHUB_TOKEN', { required: true });
    const client = getOctokit(token);

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
      /**
       * If the event type is a pull request we need to make sure that payload context exists
       */
      if (typeof context.payload.pull_request === 'undefined') {
        setFailed('Could not find the pull_request context.');
        return;
      }

      const buildFolder = 'dist';

      console.log('Searching in', `${process.env.GITHUB_WORKSPACE}/${buildFolder}`);

      const paths = await globby(`${process.env.GITHUB_WORKSPACE}/${buildFolder}`, {
        expandDirectories: {
          files: ['package.json'],
        },
      });
      console.log(paths);

      // const checks = [
      //   {
      //     name: '@nhl/sharks',
      //     callback: async () => 'Check passed!',
      //   },
      //   {
      //     name: '@nhl/goldenknights',
      //     callback: async () => 'Check passed!',
      //   },
      //   {
      //     name: '@nhl/kraken',
      //     callback: async () => 'Check passed!',
      //   },
      //   {
      //     name: '@nhl/penguins',
      //     callback: async () => 'Check passed!',
      //   },
      // ];

      // client.pulls.update({
      //   owner,
      //   repo,
      //   pull_number: number,
      //   title: titleFormat
      //     .replace('%prefix%', ticketPrefix)
      //     .replace('%id%', id)
      //     .replace('%title%', title)
      // });

      /* eslint-disable @typescript-eslint/camelcase */

      // await client.checks.create({
      //   owner: 'pqt',
      //   repo: 'nhl',
      //   name: '@nhl/sharks',
      //   head_sha: sha,
      //   status: 'queued',
      // });

      // await client.checks.create({
      //   owner: 'pqt',
      //   repo: 'nhl',
      //   name: '@nhl/penguins',
      //   head_sha: sha,
      //   status: 'queued',
      // });

      // await client.checks.create({
      //   owner: 'pqt',
      //   repo: 'nhl',
      //   name: '@nhl/kraken',
      //   head_sha: sha,
      //   status: 'queued',
      // });

      console.log(`Starting status checks for commit ${context.payload.after}`);
      await Promise.all(
        [
          {
            name: 'My Check',
            callback: async () => 'Check passed!',
          },
        ].map(async (check) => {
          const { name, callback } = check;

          await fetch(`https://api.github.com/repos/pqt/nhl/statuses/${context.payload.after}`, {
            method: 'POST',
            body: JSON.stringify({
              state: 'pending',
              description: 'Running check..',
              context: name,
            }),
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          // await setStatus(statusCheckUrl, name, 'pending', 'Running check..');

          try {
            const response = await callback();

            await fetch(`https://api.github.com/repos/pqt/nhl/statuses/${context.payload.after}`, {
              method: 'POST',
              body: JSON.stringify({
                state: 'success',
                description: response,
                context: name,
              }),
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            // await setStatus(statusCheckUrl, name, 'success', response);
          } catch (error) {
            const message = error ? error.message : 'Something went wrong';

            await fetch(`https://api.github.com/repos/pqt/nhl/statuses/${context.payload.after}`, {
              method: 'POST',
              body: JSON.stringify({
                state: 'success',
                description: message,
                context: name,
              }),
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          }
        })
      );

      console.log('Finished status checks');

      // await client.checks
      //   .create({
      //     owner: 'pqt',
      //     repo: 'nhl',
      //     name: '@nhl/goldenknights',
      //     head_sha: sha,
      //     output: {
      //       title: '@nhl/goldenknights',
      //       summary: 'One of the coolest NHL teams around.',
      //       annotations: [
      //         {
      //           path: '',
      //           start_line: 1,
      //           end_line: 1,
      //           annotation_level: 'notice',
      //           message: '',
      //         },
      //       ],
      //       images: [
      //         {
      //           alt: '',
      //           image_url: '',
      //         },
      //       ],
      //     },
      //     actions: [
      //       {
      //         label: '',
      //         description: '',
      //         identifier: '',
      //       },
      //     ],
      //   })
      //   .catch((error) => console.log(JSON.stringify(error)));

      // async function setStatus(url: string, name: string, state: string, description: string) {
      //   return fetch(url, {
      //     method: 'POST',
      //     body: JSON.stringify({
      //       state,
      //       description,
      //       context: name,
      //     }),
      //     headers: {
      //       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      //       'Content-Type': 'application/json',
      //     },
      //   });
      // }
      // (async () => {
      //   console.log(`Starting status checks for commit ${sha}`);

      //   // Run in parallel
      //   await Promise.all(
      //     checks.map(async (check) => {
      //       const { name, callback } = check;

      //       await setStatus(statusCheckUrl, name, 'pending', 'Running check..');

      //       try {
      //         const response = await callback();
      //         await setStatus(statusCheckUrl, name, 'success', response);
      //       } catch (error) {
      //         const message = error ? error.message : 'Something went wrong';
      //         await setStatus(statusCheckUrl, name, 'failure', message);
      //       }
      //     })
      //   );

      //   console.log('Finished status checks');
      // })();

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

    throw 'Throw works!';
    // setFailed('Failed just cause');
  } catch (error) {
    setFailed(error);
  }
}

run();
