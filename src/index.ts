import { debug as log, setFailed, startGroup, endGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    console.log(JSON.stringify(context));

    setFailed('Failed just cause');
  } catch (error) {
    console.log('Error');
    setFailed(error);
  }
}

run();
