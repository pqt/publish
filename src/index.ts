import { debug as log, setFailed, startGroup, endGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    console.log(JSON.stringify(context));

    const currentBranch: string = context.payload.pull_request?.head.ref;
    const defaultBranch: string = context.payload.pull_request?.head.ref;

    setFailed('Failed just cause');
  } catch (error) {
    console.log('Error');
    setFailed(error);
  }
}

run();
