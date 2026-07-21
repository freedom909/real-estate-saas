export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^uuid$": "<rootDir>/src/__tests__/__mocks__/uuid.ts",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid|amqplib|bullmq|ws)/)"
  ],
};
