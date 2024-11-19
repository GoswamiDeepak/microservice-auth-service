/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    verbose: true,
    collectCoverage: true,
    coverageProvider: 'v8',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!tests/**',
        '!dist/**',
        '!**/node_modules/**',
    ],
};
