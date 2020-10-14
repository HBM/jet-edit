module.exports = {
  // preset: 'ts-jest',
  // globals: {
  //   'ts-jest': {
  //     tsConfig: 'tsconfig.test.json'
  //   }
  // },
  cacheDirectory: '<rootDir>/.cache/jest',
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/compiled/app/**/*'],
  coveragePathIgnorePatterns: ['/node_modules/', '(\\.test).([jt]s?(x))$'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text'],
  testMatch: ['**/*\\.test\\.[jt]s?(x)'],
  moduleDirectories: ['app', 'node_modules'],
  transformIgnorePatterns: ['<rootDir>/node_modules/']
}
