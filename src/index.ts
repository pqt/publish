import { debug as log, setFailed, startGroup, endGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    startGroup('Complete context log');
    console.log(JSON.stringify(context));
    endGroup();
    startGroup('Check Version');
    endGroup();
    startGroup('Publish to NPM');
    endGroup();
    startGroup('Publish to GPR');
    endGroup();

    setFailed('Failed just cause');
  } catch (error) {
    console.log('Error');
    setFailed(error);
  }
}

run();
