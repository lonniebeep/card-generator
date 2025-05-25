const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',  // MySQL server host
  user: 'root',       // MySQL username
  password: 'Partypeople29!' // MySQL password
});

connection.connect(err => {
  if (err) {
    return console.error('Error connecting: ' + err.stack);
  }
  console.log('Connected as id ' + connection.threadId);
});

// Create a database
connection.query('CREATE DATABASE IF NOT EXISTS Card_generator', (err, result) => {
  if (err) throw err;
  console.log("Database created");
});

connection.end();
