const path = require('path');

module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@assets': './assets',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@context': './src/context',
          '@types': './src/types',
          '@theme': './src/constants/theme',
          '@app': './App',
        },
      },
    ],
  ];

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
