// controllers/urlController.js -> 
import supabase from '../db.js';
import { generate } from 'shortid';
import { toDataURL } from 'qrcode';

// Create short URL and QR Code
export async function createShortUrl(req, res) {
  const { fullUrl } = req.body;
  console.log(`Creating short URL for ${fullUrl}`);
  const shortCode = generate();
  const shortUrl = `${process.env.BACKEND_URL}/s/${shortCode}`;

  try {
    // Insert URL into the Supabase database
    const { data, error } = await supabase
      .from('urls')
      .insert([{ full_url: fullUrl, short_code: shortCode }])
      .select();

    if (error) throw error;

    // Generate QR code in Base64 format
    const qrCodeBase64 = await toDataURL(shortUrl);

    // Send response with both short URL and QR code
    res.status(201).json({
      shortUrl,
      qrCode: qrCodeBase64,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Redirect short URL to original URL
export async function redirectUrl(req, res) {
  const { code } = req.params;
  console.log(`Redirecting to ${code}`);

  try {
    // Fetch URL from Supabase based on the short code
    const { data: urlData, error } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', code)
      .single();

    if (error || !urlData) return res.status(404).json({ error: 'URL not found' });

    const url = urlData.full_url;

    // Update click count in `urls` table
    await supabase
      .from('urls')
      .update({ click_count: urlData.click_count + 1 })
      .eq('id', urlData.id);

    // Insert click event into `clicks` table
    await supabase
      .from('clicks')
      .insert([{ url_id: urlData.id, ip_address: req.ip }]);

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
    // Fetch URL data from Supabase based on the short code
    const { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', code)
      .single();

    if (urlError || !urlData) return res.status(404).json({ error: 'URL not found' });

    // Fetch clicks related to this URL
    const { data: clicksData, error: clicksError } = await supabase
      .from('clicks')
      .select('*')
      .eq('url_id', urlData.id);

    if (clicksError) throw clicksError;

    res.status(200).json({ totalClicks: clicksData.length, clicks: clicksData });
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