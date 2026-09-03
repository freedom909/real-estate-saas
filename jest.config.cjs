/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "__tests__/e2e/"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/seeds/**",
  ],
  coverageReporters: ["text", "text-summary", "lcov", "json-summary"],
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^uuid$": "<rootDir>/src/__tests__/__mocks__/uuid.ts",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid|amqplib|bullmq|ws)/)"
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { diagnostics: false }],
  },
};
