/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.lib.json",
    },
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["**/__tests__/**/*.test.tsx"],
};
