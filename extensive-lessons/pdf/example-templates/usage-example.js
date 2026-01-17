/**
 * Usage Example for Fiszki Generator
 * 
 * This shows how to use the flashcard generator with JSON data
 */

// In Node.js:
// const FiszkiGenerator = require('./fiszki-generator.js');
// const fs = require('fs');

// In browser, FiszkiGenerator is available globally

// Example 1: Load data from JSON file (Node.js)
function example1() {
    // const FiszkiGenerator = require('./fiszki-generator.js');
    // const fs = require('fs');
    // 
    // const data = JSON.parse(fs.readFileSync('example-data.json', 'utf8'));
    // const generator = new FiszkiGenerator();
    // const pdf = generator.generate(data);
    // 
    // fs.writeFileSync('fiszki.pdf', pdf);
    // console.log('Flashcards PDF generated!');
}

// Example 2: Use inline data
function example2() {
    const cards = [
        { question: "What is JavaScript?", answer: "A programming language" },
        { question: "What is HTML?", answer: "HyperText Markup Language" },
        { question: "What is CSS?", answer: "Cascading Style Sheets" },
        { question: "What is PDF?", answer: "Portable Document Format" }
    ];

    const generator = new FiszkiGenerator();
    const pdf = generator.generate(cards, {
        cardsPerRow: 2,      // 2 cards per row
        cardsPerColumn: 2,   // 2 cards per column (4 cards per page)
        fontSize: 16,        // Font size in points
        cardMargin: 20,      // Space between cards
        pageMargin: 30       // Margin around page
    });

    // In Node.js: fs.writeFileSync('fiszki.pdf', pdf);
    // In browser: download as blob
    console.log('PDF generated:', pdf.length, 'bytes');
    return pdf;
}

// Example 3: Custom layout (3x3 grid)
function example3() {
    const cards = [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
        { question: "Q4", answer: "A4" },
        { question: "Q5", answer: "A5" },
        { question: "Q6", answer: "A6" },
        { question: "Q7", answer: "A7" },
        { question: "Q8", answer: "A8" },
        { question: "Q9", answer: "A9" }
    ];

    const generator = new FiszkiGenerator();
    const pdf = generator.generate(cards, {
        cardsPerRow: 3,
        cardsPerColumn: 3,
        fontSize: 14,
        cardMargin: 15,
        pageMargin: 25
    });

    return pdf;
}

// Example 4: Browser usage
function example4Browser() {
    // Load JSON file via fetch
    fetch('example-data.json')
        .then(response => response.json())
        .then(cards => {
            const generator = new FiszkiGenerator();
            const pdf = generator.generate(cards);

            // Create blob and download
            const blob = new Blob([pdf], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fiszki.pdf';
            a.click();
        });
}

// Run example if in Node.js
if (typeof require !== 'undefined') {
    const FiszkiGenerator = require('./fiszki-generator.js');
    const fs = require('fs');
    
    // Load example data
    const data = JSON.parse(fs.readFileSync(__dirname + '/example-data.json', 'utf8'));
    const generator = new FiszkiGenerator();
    const pdf = generator.generate(data);
    
    fs.writeFileSync(__dirname + '/fiszki-output.pdf', pdf);
    console.log('Flashcards PDF generated: fiszki-output.pdf');
}

