const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Fix Windows hoisting: bottom-tabs must resolve elements from project root
config.resolver.extraNodeModules = {
  '@react-navigation/elements': path.resolve(
    projectRoot,
    'node_modules/@react-navigation/elements'
  ),
};

module.exports = config;
