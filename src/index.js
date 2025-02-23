#!/usr/bin/env node
import { MAX_CARDS } from './config.js';
import { generateTTS } from './ttsService.js';
import { findCards, getCardsInfo, hasAudio, storeMediaFile, updateNoteFields } from './ankiService.js';
import { renderHtml } from './htmlUtils.js';

/**
 * Process a batch of items with a concurrency limit
 * @param {Array} items Items to process
 * @param {number} [maxConcurrent=10] Maximum number of concurrent operations
 * @returns {Promise<Array>} Array of processing results
 */
async function processBatchWithConcurrency(items, maxConcurrent = 10) {
  let active = 0;
  let nextIndex = 0;
  const results = new Array(items.length);

  async function processCard(card, index) {
    try {
      const currentFront = card?.fields?.Front?.value;
      if (!currentFront) {
        throw new Error('Card front field is missing or invalid');
      }
      const textWithoutSound = removeSoundTags(currentFront);
      const text = renderHtml(textWithoutSound);
      
      console.log(`\nProcessing Card #${index + 1} [ID: ${card.cardId}]`);
      console.log(`Generating audio for: ${text}`);
      
      const audioFilepath = await generateTTS(text);
      const audioFilename = audioFilepath.split('/').pop();
      const audioTag = `[sound:${audioFilename}]`;
      const newFront = currentFront + '<br><br>' + audioTag;
      
      await updateNoteFields(card.note, {
        Front: newFront
      });
      
      // Store the audio file in Anki
      await storeMediaFile(audioFilepath);
      console.log(`Added audio: ${audioFilename}`);
      console.log('---');
      return { status: 'fulfilled', value: { success: true, cardId: card.cardId } };
    } catch (error) {
      console.error(`Failed to process Card #${index + 1} [ID: ${card.cardId}]:`, error);
      return { status: 'fulfilled', value: { success: false, cardId: card.cardId, error: error.message } };
    }
  }

  async function startNextCard() {
    if (nextIndex >= items.length) return;
    
    active++;
    const currentIndex = nextIndex++;
    const card = items[currentIndex];
    
    results[currentIndex] = await processCard(card, currentIndex);
    
    active--;
    startNextCard(); // Start next card when this one finishes
  }

  // Start initial batch of cards
  const initialBatch = Math.min(maxConcurrent, items.length);
  for (let i = 0; i < initialBatch; i++) {
    startNextCard();
  }

  // Wait for all cards to complete
  while (active > 0 || nextIndex < items.length) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Removes Anki sound tags from text
 * @param {string} text The text containing sound tags
 * @returns {string} Text with sound tags removed
 */
function removeSoundTags(text) {
  // First remove sound tags
  return  text.replace(/\[sound:[^\]]+\]/g, '');
}

/**
 * Main function to find cards without audio in a given deck and add TTS audio.
 */
async function grepAnkiCards() {
  try {
    // Step 1: Find card IDs in the deck
    const allCardIds = await findCards('-deck:"+170 English Irregular verbs"');

    // Step 2: Slice to the first MAX_CARDS IDs if there are more
    const limitedCardIds = allCardIds.slice(0, MAX_CARDS);
    
    // Step 3: Retrieve info about these cards
    const cardsInfo = await getCardsInfo(limitedCardIds);
    
    // Step 4: Filter cards without audio and deduplicate by note ID
    const cardsWithoutAudio = cardsInfo.filter(card => !hasAudio(card));
    const seenNotes = new Set();
    const uniqueCards = cardsWithoutAudio.filter(card => {
      if (seenNotes.has(card.note)) {
        return false;
      }
      seenNotes.add(card.note);
      return true;
    });
    
    console.log(`Found ${uniqueCards.length} unique notes without audio.\n`);
    
    // If no cards to modify, exit early
    if (uniqueCards.length === 0) {
      console.log('No cards need modification.');
      return;
    }
    
    // Show sentences that would be affected
    console.log('The following sentences would be modified:');
    for (const card of uniqueCards) {
      const frontValue = card?.fields?.Front?.value;
      if (frontValue) {
        const textWithoutSound = removeSoundTags(renderHtml(frontValue));
        console.log(`\nCard #${uniqueCards.indexOf(card) + 1}: ${renderHtml(textWithoutSound)}`);
      }
    }
    
    // Ask for approval only if there are cards to modify
    const readline = (await import('readline')).createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const response = await new Promise(resolve => {
      readline.question('\nDo you want to proceed with adding audio to these cards? (yes/no): ', answer => {
        readline.close();
        resolve(answer.toLowerCase());
      });
    });

    if (response !== 'yes' && response !== 'y') {
      console.log('Operation cancelled.');
      return;
    }

    // If approved, proceed with modifications
    console.log('\nProceeding with modifications...');
    
    // Process all cards with concurrency limit
    const results = await processBatchWithConcurrency(uniqueCards);
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = uniqueCards.length - successful;
    
    console.log(`\nProcessing complete:`);
    console.log(`- Successfully added audio to ${successful} cards`);
    if (failed > 0) {
      console.log(`- Failed to process ${failed} cards`);
    }
  } catch (error) {
    console.error('\nError grepping Anki cards:', error);
  }
}

// Run the main function when this script is executed
grepAnkiCards();
