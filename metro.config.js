const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  // Add this for better hot reloading
  server: {
    rewriteRequestUrl: (url) => {
      if (!url.endsWith('.bundle') && !url.endsWith('.map')) {
        return url;
      }
      // Fix cache issues with hot reload
      return url + '?platform=ios&dev=true&minify=false&hot=true';
    }
  }
};

module.exports = mergeConfig(defaultConfig, config);