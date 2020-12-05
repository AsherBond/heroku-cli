#!/usr/bin/env node

const glob = require('glob')
const concurrently = require('concurrently')
const path = require('path')
const os = require('os')

const root = path.join(__dirname, '..')
const packages = glob.sync(`${root}/packages/*`)

const commands = packages.map(packagePath => {
  const packageName = path.relative(root, path.basename(packagePath));
  return {
    name: `packages/${packageName}`,
    command: `yarn --cwd="${path.normalize(packagePath)}" prepack`,
    env: {
      FORCE_COLOR: '0'
    },
    prefixColor: 'white'
  }
});

async function run() {
  const SIGINT_HANDLER = () => {
    console.log('Received ctrl+c. Stopping scripts/prepack-all.js');
    process.stdout.write('\n');
    process.exit(1)
  }
  let exitCode = 0;
  try {
    process.once('SIGINT', SIGINT_HANDLER);
    await concurrently(commands, {
      maxProcesses: process.env.CI ? os.cpus() : 4,
      killOthers: ['failure']
    })
  } catch (err) {
    exitCode = 1;
    console.log('Error running tests: ', err);
  } finally {
    process.removeListener('SIGINT', SIGINT_HANDLER);
    process.exit(exitCode);
  }
}

run()

