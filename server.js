const express = require('express');
const mysql = require('mysql');
const { createWriteStream } = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Partypeople29!',
    database: 'Card_generator'
});

db.connect();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// Route for form submission
app.post('/submit', async (req, res) => {
    const { card_type, recipient_name, message } = req.body;

    // Load background image based on card type
    const backgroundImage = await loadImage(`./img/${card_type.replace(/\s+/g, '_')}.png`);

    // Create canvas and draw background image
    const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw recipient's name and message on canvas
    ctx.font = '100px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`Dear ${recipient_name},`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 40);

    // Save canvas to a PNG file
    const downloadLink = `/download_links/${card_type.toLowerCase()}_${recipient_name.replace(/\s+/g, '_')}.png`;
    const filePath = `.${downloadLink}`;
    const outputStream = createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(outputStream);

    outputStream.on('finish', () => {
        // Insert form data into MySQL
        const sql = `INSERT INTO cards (card_type, recipient_name, message, download_link) VALUES (?, ?, ?, ?)`;
        db.query(sql, [card_type, recipient_name, message, downloadLink], (err, result) => {
            if (err) {
                throw err;
            }
            console.log('Form data inserted into MySQL:', result);
            
            // Redirect to the generated-image.html page with the image URL as a query parameter
           res.redirect(`/generated-image.html?image=${encodeURIComponent(filePath)}`);
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
