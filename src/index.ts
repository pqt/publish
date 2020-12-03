import { setFailed, startGroup, endGroup } from '@actions/core';

/**
 * The entrypoint for the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    startGroup('Check Version');
    endGroup();
    startGroup('Publish to NPM');
    endGroup();
    startGroup('Publish to GPR');
    endGroup();
  } catch (error) {
    console.log('Error');
    setFailed(error);
  }
}

run();
