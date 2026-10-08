const { getDefaultConfig } = require("@expo/metro-config")

const defaultConfig = getDefaultConfig(__dirname)
defaultConfig.resolver.sourceExts.push("cjs")

// Workaround for Windows path issue with node: protocol
defaultConfig.resolver.unstable_enablePackageExports = false

module.exports = defaultConfig
