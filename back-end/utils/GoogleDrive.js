const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Resolve the path to the JSON key file
const apiKeyPath = path.resolve(__dirname, '../../apikey.json');

// Ensure the key file exists before proceeding
if (!fs.existsSync(apiKeyPath)) {
    throw new Error(`Service account key file not found at path: ${apiKeyPath}`);
}

// Read and parse the JSON key file
const apiKey = JSON.parse(fs.readFileSync(apiKeyPath, 'utf8'));

// Set up the authentication
const auth = new google.auth.JWT({
    email: apiKey.client_email,
    key: apiKey.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

// Initialize the Google Drive client
const drive = google.drive({ version: 'v3', auth });

module.exports = drive;
