const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Metro config
export default (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver } = config;

  // Add the 'cjs' extension to the assetExts array
  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts, 'cjs'],
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          // Redirect all module requests to the local node_modules
          return path.join(process.cwd(), `node_modules/${name}`);
        },
      }
    ),
  };

  // Add support for the 'mjs' extension
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

  return config;
})();
