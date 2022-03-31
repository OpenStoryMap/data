import * as fs from 'fs';

export interface Config {
  censusApiKey?: string
}

function loadConfig(): Config|null {
  if (fs.existsSync('./config.json')) {
    return require('./config.json');
  }

  return null;
}

const config = loadConfig();

export default config;
