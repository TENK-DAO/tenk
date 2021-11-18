module.exports = require("near-willem-workspaces-ava/ava.config.cjs")
require('util').inspect.defaultOptions.depth = 10; // Increase AVA's printing depth
module.exports.files.push("!workspaces-js/**/*")