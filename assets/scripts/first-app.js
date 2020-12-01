// Imports file system functionality provided by nodejs
const fs = require('fs');

// Creates a file called hello.txt with the content as the second argument
fs.writeFileSync('hello.txt', 'Hello from Node.js');