module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/test/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transformIgnorePatterns: ["node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo-modules-core|expo(nent)?|@expo(nent)?/.*|react-native-safe-area-context)/)"],
};
