import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup\\.ts$'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
};

export default createJestConfig(config);
