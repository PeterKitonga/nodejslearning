const path = require('path')

/**
 * require.main.filename gets the file that serves the nodejs app
*/
module.exports = path.dirname(require.main.filename)