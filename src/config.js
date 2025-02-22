import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Anki Connect configuration
export const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';
export const MAX_CARDS = 100;

// OpenAI TTS configuration
export const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

// File system configuration
export const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

// Helper function to create a delay
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
