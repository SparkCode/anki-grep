# anki-audio-enrich

A Node.js tool that automatically enriches Anki cards with text-to-speech (TTS) audio. It scans your Anki deck for cards without audio, generates TTS audio for their content, and seamlessly integrates the audio into the cards.

## Prerequisites

1. [Anki](https://apps.ankiweb.net/) must be installed and running
2. [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on must be installed:
   - Open Anki
   - Go to Tools > Add-ons > Get Add-ons
   - Enter code: 2055492159
   - Restart Anki
3. OpenAI API key (set as OPENAI_API_KEY environment variable)

## Installation

```bash
npm install
```

## Features

- Automatically detects cards without audio
- Generates high-quality TTS audio using OpenAI's API:
  - Uses the latest tts-1 model
  - Randomly selects from 6 different voices (alloy, echo, fable, onyx, nova, shimmer)
  - Creates natural-sounding speech with proper intonation
- Batch processes cards with concurrency control
- Deduplicates cards by note ID to avoid redundant processing
- Interactive confirmation before making changes
- Detailed progress logging
- HTML content support with proper text extraction

## Usage

1. Make sure Anki is running with AnkiConnect installed
2. Run the script:
   ```bash
   npm start
   ```

The tool will:
1. Connect to AnkiConnect
2. Find cards without audio
3. Show you the content that will be modified
4. Ask for confirmation before proceeding
5. Generate and add audio to approved cards
6. Provide a summary of successful and failed operations

## How It Works

1. **Card Detection**: The tool searches for cards that don't have audio tags (`[sound:...]`)
2. **Content Extraction**: For each card, it:
   - Removes existing sound tags (if any)
   - Extracts clean text from HTML content
3. **Audio Processing**: 
   - Generates TTS audio for the extracted text
   - Stores the audio file in Anki's media collection
   - Adds the audio reference to the card's front field
4. **Batch Processing**: 
   - Processes multiple cards concurrently for efficiency
   - Maintains a concurrency limit to prevent overload

## Error Handling

If you see a connection error, ensure:
1. Anki is running
2. AnkiConnect add-on is installed
3. AnkiConnect is properly configured and listening on port 8765

For other errors:
- Check the console output for specific error messages
- Each card processing error is logged individually
- Failed cards are reported in the final summary

## License

MIT
