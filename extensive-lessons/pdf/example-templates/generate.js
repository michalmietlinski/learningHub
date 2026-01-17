/**
 * Generate flashcards PDF from JSON data
 * 
 * Usage: node generate.js [input.json] [output.pdf]
 * 
 * Defaults:
 * - Input: example-data.json
 * - Output: fiszki.pdf
 */

const FiszkiGenerator = require('./fiszki-generator.js');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const inputFile = process.argv[2] || path.join(__dirname, 'example-data.json');
const outputFile = process.argv[3] || path.join(__dirname, 'fiszki.pdf');

// Load JSON data
let cards;
try {
    const jsonData = fs.readFileSync(inputFile, 'utf8');
    cards = JSON.parse(jsonData);
    console.log('Loaded', cards.length, 'flashcards from', inputFile);
} catch (error) {
    console.error('Error loading JSON file:', error.message);
    process.exit(1);
}

// Generate PDF
const generator = new FiszkiGenerator();
const pdf = generator.generate(cards, {
    cardsPerRow: 2,      // 2 cards per row
    cardsPerColumn: 2,   // 2 cards per column (4 cards per page)
    fontSize: 16,        // Font size in points
    cardMargin: 20,      // Space between cards
    pageMargin: 30       // Margin around page
});

// Save PDF to file
try {
    fs.writeFileSync(outputFile, pdf);
    console.log('Flashcards PDF generated successfully!');
    console.log('Output file:', outputFile);
    console.log('File size:', Math.round(pdf.length / 1024), 'KB');
} catch (error) {
    console.error('Error writing PDF file:', error.message);
    process.exit(1);
}

