const express = require('express');
const { Pool } = require('pg');
const { createWriteStream } = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const app = express();

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ufyEkd6Ax1aY@ep-withered-water-a856l8mm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Middleware to parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(__dirname));

// POST /submit route
app.post('/submit', async (req, res) => {
    const { card_type, recipient_name, message } = req.body;
    const backgroundImage = await loadImage(path.join(__dirname, `${card_type.replace(/\s+/g, '_')}.png`));
    const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    ctx.font = '100px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`Dear ${recipient_name},`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 40);

    const downloadLink = `/download_links/${card_type.toLowerCase()}_${recipient_name.replace(/\s+/g, '_')}.png`;
    const filePath = path.join(__dirname, downloadLink);
    const outputStream = createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(outputStream);

    outputStream.on('finish', () => {
        const sql = `INSERT INTO cards (card_type, recipient_name, message, download_link) VALUES ($1, $2, $3, $4)`;
        pool.query(sql, [card_type, recipient_name, message, downloadLink], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }
            console.log('Form data inserted into Postgres:', result);
            res.redirect(`/generated-image.html?image=${encodeURIComponent(downloadLink)}`);
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
