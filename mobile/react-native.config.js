module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './assets/fonts/',
    './assets/images/',
  ],
  dependencies: {
    // Add any native module configurations here
  },
  // This is needed for react-native-svg-transformer
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  // This is needed for react-native-svg-transformer
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'svg'],
  },
};
