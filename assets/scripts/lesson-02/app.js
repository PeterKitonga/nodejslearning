const http = require('http');

// import the routes
const { routes } = require('./router');

// serves up the application and listens for requests as well as send responses back
const server = http.createServer(routes);

// this is where we assign the nodejs app to a port
server.listen(3000);