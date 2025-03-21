export default {
  testMatch: ["<rootDir>/src/test/**/*.(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
}
