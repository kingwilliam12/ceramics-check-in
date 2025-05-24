// babel.config.js with Reanimated plugin
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@assets": "./src/assets",
            "@hooks": "./src/hooks",
            "@services": "./src/services",
            "@context": "./src/context",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@types": "./src/types"
          }
        }
      ],
      'react-native-reanimated/plugin', 
    ],
  };
};