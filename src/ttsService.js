import OpenAI from 'openai';
import { VOICES } from './config.js';
import { sanitizeFilename, saveBufferToFile } from './fileUtils.js';

// Check if OPENAI_API_KEY is set
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI();

/**
 * Generates TTS audio for the given text
 * @param {string} text The text to convert to speech
 * @returns {Promise<string>} The filename of the generated audio
 */
export async function generateTTS(text) {
  try {
    // Select random voice
    const randomVoice = VOICES[Math.floor(Math.random() * VOICES.length)];
    console.log(`Generating TTS using voice: ${randomVoice}...`);

    // Generate speech with OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: randomVoice,
      input: text,
    });

    // Generate filename with openai-generated prefix and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `openai-generated-${sanitizeFilename(text)}-${timestamp}.mp3`;

    // Save the audio file
    console.log('Saving audio file...');
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filepath = await saveBufferToFile(buffer, filename);

    return filepath;
  } catch (error) {
    throw new Error(`TTS Generation Error: ${error.message}`);
  }
}
