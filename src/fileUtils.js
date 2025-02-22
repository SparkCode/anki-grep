import fs from 'fs';
import { ASSETS_DIR } from './config.js';

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

/**
 * Sanitizes a filename by removing invalid characters and limiting length
 * @param {string} text The text to sanitize
 * @returns {string} The sanitized filename
 */
export const sanitizeFilename = (text) => 
  text.slice(0, 40)
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

/**
 * Saves a buffer to a file in the assets directory
 * @param {Buffer} buffer The buffer to save
 * @param {string} filename The filename to save as
 * @returns {Promise<string>} The full filepath
 */
export const saveBufferToFile = async (buffer, filename) => {
  const filepath = `${ASSETS_DIR}/${filename}`;
  await fs.promises.writeFile(filepath, buffer);
  return filepath;
};
