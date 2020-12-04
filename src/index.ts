import { debug as log, setFailed, startGroup, endGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    let releaseCandidate = false;

    /**
     * Full Context Debugger (Just for now)
     */
    startGroup('[REMOVE] Full Context Object');
    console.log(JSON.stringify(context));
    endGroup();

    /**
     * The current HEAD (source) branch for the PR
     */
    const currentBranch: string = context.payload.pull_request?.head.ref;

    /**
     * The target BASE branch for the PR
     */
    const targetBranch: string = context.payload.pull_request?.base.ref;

    /**
     * The main DEFAULT branch for the codebase
     */
    const defaultBranch: string = context.payload.repository?.default_branch;

    /**
     * If the target branch matches the repository default.
     * Should that be the case, we're tagging it as a release candidate
     */
    if (targetBranch === defaultBranch) {
      releaseCandidate = true;
      startGroup('[REMOVE] Full Context Object');
      console.log(`[RELEASE CANDIDATE]:`, true);
      endGroup();
    }

    setFailed('Failed just cause');
  } catch (error) {
    console.log('Error');
    setFailed(error);
  }
}

run();
