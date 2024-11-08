// controllers/urlController.js -> 
import db from '../db.js';
import { generate } from 'shortid';
import { toDataURL } from 'qrcode';

// Create short URL and QR Code
// async await = syncronuous 
// 1 2 3 4 5 6 7 8 9 
// 1 3 5 7 2 8 3 
// req == FULL URL
// SUSSESS (200) => short url
// FAIL (500) => ERROR
export async function createShortUrl(req, res) {
  // Req == object 
  // FULL URL -> req body
  const { fullUrl } = req.body;
  const shortCode = generate(); // Random string
  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`; // req.protoco = [http / https] | req.get('host') == [ip / domain] localhost
  // http://localhost/s/efwedsfew

  try {
    // Insert URL into the database
    const result = await db.query(
      'INSERT INTO urls (full_url, short_code) VALUES ($1, $2) RETURNING *',
      [fullUrl, shortCode]
    );

    // Generate QR code in Base64 format
    const qrCodeBase64 = await toDataURL(shortUrl);

    // Send response with both short URL and QR code
    res.status(201).json({
      shortUrl,
      qrCode: qrCodeBase64,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Redirect short URL to original URL
// http://localhost/s/efwedsfew -> www.google.com

export async function redirectUrl(req, res) {
  const { code } = req.params;
  console.log(`Redirecting to ${code}`);

  try {
    // Full url in database | select all from table url with short_code == req.params  
    const result = await db.query('SELECT * FROM urls WHERE short_code = $1', [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'URL not found' });

    const url = result.rows[0].full_url;

    // Update click count in `urls` table
    await db.query('UPDATE urls SET click_count = click_count + 1 WHERE id = $1', [result.rows[0].id]);

    // Insert click event into `clicks` table
    await db.query('INSERT INTO clicks (url_id, ip_address) VALUES ($1, $2)', [result.rows[0].id, req.ip]);

    // Redirect to the original URL, ensuring it includes protocol
    const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    res.redirect(targetUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Generate QR code for an existing short URL
export async function getQrCode(req, res) {
  const { code } = req.params;
  const shortUrl = `${req.protocol}://${req.get('host')}/s/${code}`;

  try {
    const qrCodeBase64 = await toDataURL(shortUrl);
    res.status(200).json({ qrCode: qrCodeBase64 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR Code' });
  }
}

// Get statistics for short URL
export async function getStats(req, res) {
  const { code } = req.params;

  try {
    const urlResult = await db.query('SELECT * FROM urls WHERE short_code = $1', [code]);
    if (urlResult.rows.length === 0) return res.status(404).json({ error: 'URL not found' });

    const clicksResult = await db.query('SELECT * FROM clicks WHERE url_id = $1', [urlResult.rows[0].id]);
    res.status(200).json({ totalClicks: clicksResult.rowCount, clicks: clicksResult.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



// https://www.google.com -> https://c.com/go 
//                                 |
//                               Qr code

//                               [Full url, short url, qrcode] -> database


// API = service 1: https://www.google.com -> https://c.com/go 
//   service 2: https://c.com/go -> Qr code
//   service 3:   https://c.com/go and Qr code -> https://www.google.com
//   service 4: [Full url, short url, qrcode] -> database