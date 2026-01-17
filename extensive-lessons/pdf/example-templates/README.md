# Fiszki (Flashcards) Generator Template

A simple template for generating flashcards PDFs for double-sided A4 printing.

## Structure

- **Page 1**: Questions
- **Page 2**: Answers (symmetrical layout for double-sided printing)

Cards are arranged in a grid that can be cut after printing.

## Files

- `fiszki-generator.js` - Main generator class
- `example-data.json` - Example JSON data with questions and answers
- `usage-example.js` - Usage examples
- `README.md` - This file

## Input Format

JSON array of objects with `question` and `answer` properties:

```json
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris"
  },
  {
    "question": "What is 2 + 2?",
    "answer": "4"
  }
]
```

## Usage

### Node.js

```javascript
const FiszkiGenerator = require('./fiszki-generator.js');
const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('example-data.json', 'utf8'));
const generator = new FiszkiGenerator();
const pdf = generator.generate(cards);

fs.writeFileSync('fiszki.pdf', pdf);
```

### Browser

```javascript
// Load JSON
fetch('example-data.json')
    .then(response => response.json())
    .then(cards => {
        const generator = new FiszkiGenerator();
        const pdf = generator.generate(cards);
        
        // Download
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fiszki.pdf';
        a.click();
    });
```

## Options

```javascript
generator.generate(cards, {
    cardsPerRow: 2,      // Number of cards per row (default: 2)
    cardsPerColumn: 2,   // Number of cards per column (default: 2)
    fontSize: 16,        // Font size in points (default: 16)
    cardMargin: 20,      // Space between cards in points (default: 20)
    pageMargin: 30       // Page margin in points (default: 30)
});
```

## Layout

- **A4 size**: 595 x 842 points
- Cards are arranged in a grid
- Page 1 shows questions, Page 2 shows answers
- Layout is symmetrical for double-sided printing
- Cards have light gray borders for easy cutting

## Example Layouts

### 2x2 Grid (4 cards per page)
- Good for longer text
- Larger cards
- Default layout

### 3x3 Grid (9 cards per page)
- Good for shorter text
- More cards per page
- Smaller cards

## Printing Instructions

1. Generate PDF with questions and answers
2. Print Page 1 (questions) on one side
3. Flip paper and print Page 2 (answers) on the other side
4. Cut along the card borders
5. Cards are now ready to use!

## Simplifications

This template is simpler than the main generator because:

1. **Fixed layout**: Only supports grid layout (no complex positioning)
2. **Two pages only**: Questions and answers (no multi-page support)
3. **Single font**: Uses only Helvetica (no font selection)
4. **Basic styling**: Simple borders and black text
5. **No graphics**: Only text and borders (no images or complex shapes)

The essential PDF structure remains the same, but the content generation is simplified for the specific use case of flashcards.

