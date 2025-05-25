const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Partypeople29!',
    database: 'Card_generator'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Route for form submission
app.post('/submit', (req, res) => {
    const { recipient_name, message } = req.body;

    // Insert form data into MySQL
    const sql = `INSERT INTO cards (card_type, recipient_name, message) VALUES (?, ?, ?)`;
    db.query(sql, ['Birthday Card', recipient_name, message], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Form data inserted into MySQL:', result);
        res.send('Form data submitted successfully');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
