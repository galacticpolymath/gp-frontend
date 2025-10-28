/** @type {import('jest').Config} */
const config = {
  verbose: true,
  setupFiles: ['dotenv/config'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};

module.exports = config;
