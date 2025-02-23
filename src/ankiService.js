import fetch from 'node-fetch';
import fs from 'fs';
import { ANKI_CONNECT_URL, delay } from './config.js';

// Queue for processing Anki requests sequentially
const requestQueue = {
  queue: [],
  processing: false,

  enqueue: function(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  },

  processQueue: async function() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();
    let retries = 3;

    while (retries > 0) {
      try {
        await delay(1000); // Ensure 1000ms between requests
        const result = await fn();
        resolve(result);
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Request failed after 3 attempts:', error);
          reject(error);
        } else {
          console.warn(`Request failed, ${retries} retries remaining:`, error);
          await delay(2000); // Wait longer before retry
        }
      }
    }

    this.processing = false;
    this.processQueue(); // Process next request regardless of success/failure
  }
};

/**
 * Makes a request to AnkiConnect
 * @param {string} action The action to perform
 * @param {Object} params The parameters for the action
 * @returns {Promise<any>} The response from AnkiConnect
 */
async function ankiRequest(action, params) {
  return requestQueue.enqueue(async () => {
    const payload = {
      action,
      version: 6,
      params
    };

    const response = await fetch(ANKI_CONNECT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`AnkiConnect Error (${action}): ${data.error}`);
    }
    return data.result;
  });
}

/**
 * Stores a media file in Anki
 * @param {string} filepath Path to the media file
 * @returns {Promise<string>} The filename as stored in Anki
 */
export async function storeMediaFile(filepath) {
  const filename = filepath.split('/').pop();
  const fileData = fs.readFileSync(filepath, {encoding: 'base64'});
  
  await ankiRequest('storeMediaFile', {
    filename,
    data: fileData
  });

  return filename;
}

/**
 * Updates a note's fields
 * @param {number} noteId The note ID to update
 * @param {Object} fields The fields to update
 */
export async function updateNoteFields(noteId, fields) {
  await ankiRequest('updateNoteFields', {
    note: {
      id: noteId,
      fields
    }
  });
}

/**
 * Finds cards using an Anki search query
 * @param {string} query A valid Anki search query
 * @returns {Promise<number[]>} An array of matching card IDs
 */
export async function findCards(query) {
  return await ankiRequest('findCards', { query });
}

/**
 * Gets detailed information about specific cards
 * @param {number[]} cardIds List of card IDs
 * @returns {Promise<Object[]>} Array of card info objects
 */
export async function getCardsInfo(cardIds) {
  return await ankiRequest('cardsInfo', { cards: cardIds });
}

/**
 * Checks if a card has audio content
 * @param {Object} card The card object to check
 * @returns {boolean} True if the card has audio
 */
export function hasAudio(card) {
  const soundRegex = /\[sound:.+?\]/;
  return card?.fields?.Front?.value ? soundRegex.test(card.fields.Front.value) : false;
}
