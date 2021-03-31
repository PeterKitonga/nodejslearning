const mysql = require('mysql2');

/**
 * Connection pools keep the connection to the 
 * MySQL server alive which means we can reuse 
 * a previous connection. This improves latency
 * of queries since we are not reconnecting every time.
*/
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'kitonga',
    database: 'nodejs_lessons'
});

module.exports = pool.promise();