# anki-grep

A Node.js package to retrieve (grep) up to 100 cards from a specified Anki deck using AnkiConnect.

## Prerequisites

1. [Anki](https://apps.ankiweb.net/) must be installed and running
2. [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on must be installed:
   - Open Anki
   - Go to Tools > Add-ons > Get Add-ons
   - Enter code: 2055492159
   - Restart Anki

## Installation

```bash
npm install
```

## Usage

1. Make sure Anki is running with AnkiConnect installed
2. Run the script:
   ```bash
   npm start
   ```

By default, the script will:
- Connect to AnkiConnect at `http://127.0.0.1:8765`
- Search for cards in the deck named "English learning desk"
- Retrieve up to 100 cards
- Display each card's ID, question, and answer

## Configuration

You can customize the following constants in `index.js`:

```javascript
const ANKI_CONNECT_URL = 'http://127.0.0.1:8765'; // AnkiConnect server URL
const DECK_NAME = 'English learning desk';         // Target deck name
const MAX_CARDS = 100;                            // Maximum cards to retrieve
```

## Error Handling

If you see a connection error, ensure:
1. Anki is running
2. AnkiConnect add-on is installed
3. AnkiConnect is properly configured and listening on the specified URL

## License

MIT
