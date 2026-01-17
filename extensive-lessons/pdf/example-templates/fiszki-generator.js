/**
 * Fiszki (Flashcards) PDF Generator Template
 * 
 * Generates flashcards for double-sided A4 printing.
 * Page 1: Questions
 * Page 2: Answers (symmetrical layout for double-sided printing)
 * 
 * Input: JSON array of {question, answer} objects
 */

class FiszkiGenerator {
    constructor() {
        this.objectCounter = 1;
        this.offsets = [];
    }

    /**
     * Generate flashcards PDF from JSON data
     * @param {Array<Object>} cards - Array of {question, answer} objects
     * @param {Object} options - Layout options
     * @returns {string} - Complete PDF content
     */
    generate(cards = [], options = {}) {
        const {
            cardsPerRow = 2,
            cardsPerColumn = 2,
            fontSize = 16,
            cardMargin = 20,
            pageMargin = 30
        } = options;

        this.objectCounter = 1;
        this.offsets = [];

        // A4 size: 595 x 842 points
        const pageWidth = 595;
        const pageHeight = 842;
        // Calculate card dimensions: page width - margins - spacing between cards
        const cardWidth = (pageWidth - 2 * pageMargin - (cardsPerRow - 1) * cardMargin) / cardsPerRow;
        const cardHeight = (pageHeight - 2 * pageMargin - (cardsPerColumn - 1) * cardMargin) / cardsPerColumn;

        let pdf = "%PDF-1.4\n";

        // Catalog
        const catalogObj = this.createObject({
            "/Type": "/Catalog",
            "/Pages": "2 0 R"
        });
        pdf += catalogObj.content;
        this.offsets.push({ num: 1, offset: this.getOffset(pdf, catalogObj.content) });

        // Pages object - 2 pages (front and back)
        const pagesObj = this.createObject({
            "/Type": "/Pages",
            "/Kids": "[3 0 R 4 0 R]", // Page 1 (questions) and Page 2 (answers)
            "/Count": "2"
        });
        pdf += pagesObj.content;
        this.offsets.push({ num: 2, offset: this.getOffset(pdf, pagesObj.content) });

        // Page 1: Questions
        const page1Obj = this.createObject({
            "/Type": "/Page",
            "/Parent": "2 0 R",
            "/MediaBox": "[0 0 " + pageWidth + " " + pageHeight + "]",
            "/Contents": "5 0 R",
            "/Resources": "<<\n/Font <<\n/F1 7 0 R\n>>\n>>"
        });
        pdf += page1Obj.content;
        this.offsets.push({ num: 3, offset: this.getOffset(pdf, page1Obj.content) });

        // Page 2: Answers (symmetrical)
        const page2Obj = this.createObject({
            "/Type": "/Page",
            "/Parent": "2 0 R",
            "/MediaBox": "[0 0 " + pageWidth + " " + pageHeight + "]",
            "/Contents": "6 0 R",
            "/Resources": "<<\n/Font <<\n/F1 7 0 R\n>>\n>>"
        });
        pdf += page2Obj.content;
        this.offsets.push({ num: 4, offset: this.getOffset(pdf, page2Obj.content) });

        // Content stream for Page 1 (Questions)
        const page1Content = this.createQuestionsPage(cards, cardsPerRow, cardsPerColumn, 
            pageMargin, cardMargin, cardWidth, cardHeight, fontSize);
        pdf += page1Content.content;
        this.offsets.push({ num: 5, offset: this.getOffset(pdf, page1Content.content) });

        // Content stream for Page 2 (Answers) - symmetrical layout
        const page2Content = this.createAnswersPage(cards, cardsPerRow, cardsPerColumn,
            pageMargin, cardMargin, cardWidth, cardHeight, fontSize);
        pdf += page2Content.content;
        this.offsets.push({ num: 6, offset: this.getOffset(pdf, page2Content.content) });

        // Font object
        const fontObj = this.createObject({
            "/Type": "/Font",
            "/Subtype": "/Type1",
            "/BaseFont": "/Helvetica"
        });
        pdf += fontObj.content;
        this.offsets.push({ num: 7, offset: this.getOffset(pdf, fontObj.content) });

        // Cross-reference table
        const xrefStart = pdf.length;
        pdf += "xref\n";
        pdf += "0 " + this.objectCounter + "\n";
        pdf += "0000000000 65535 f \n";
        for (let i = 1; i < this.objectCounter; i++) {
            const offset = this.offsets.find(o => o.num === i)?.offset || 0;
            pdf += String(offset).padStart(10, '0') + " 00000 n \n";
        }

        // Trailer
        pdf += "trailer\n";
        pdf += "<<\n";
        pdf += "/Size " + this.objectCounter + "\n";
        pdf += "/Root 1 0 R\n";
        pdf += ">>\n";

        // startxref
        pdf += "startxref\n";
        pdf += xrefStart + "\n";

        // EOF
        pdf += "%%EOF";

        return pdf;
    }

    /**
     * Create questions page content
     */
    createQuestionsPage(cards, cardsPerRow, cardsPerColumn, pageMargin, cardMargin, cardWidth, cardHeight, fontSize) {
        let stream = "";

        // Draw card borders and place questions
        let cardIndex = 0;
        for (let row = 0; row < cardsPerColumn; row++) {
            for (let col = 0; col < cardsPerRow; col++) {
                if (cardIndex >= cards.length) break;

                const x = pageMargin + col * (cardWidth + cardMargin);
                const y = pageMargin + (cardsPerColumn - 1 - row) * (cardHeight + cardMargin);

                // Draw card border
                stream += "0.8 0.8 0.8 rg\n"; // Light gray border
                stream += "1 w\n"; // Line width
                stream += x + " " + y + " m\n";
                stream += (x + cardWidth) + " " + y + " l\n";
                stream += (x + cardWidth) + " " + (y + cardHeight) + " l\n";
                stream += x + " " + (y + cardHeight) + " l\n";
                stream += x + " " + y + " l\n";
                stream += "S\n"; // Stroke path

                // Add question text
                const question = cards[cardIndex].question || "";
                const textX = x + 10;
                const textY = y + cardHeight - 20;

                stream += "BT\n";
                stream += "/F1 " + fontSize + " Tf\n";
                stream += "0 0 0 rg\n"; // Black text
                stream += textX + " " + textY + " Td\n";
                stream += "(" + this.escapeText(question) + ") Tj\n";
                stream += "ET\n";

                cardIndex++;
            }
        }

        return this.createContentStreamObject(stream);
    }

    /**
     * Create answers page content (symmetrical to questions)
     */
    createAnswersPage(cards, cardsPerRow, cardsPerColumn, pageMargin, cardMargin, cardWidth, cardHeight, fontSize) {
        let stream = "";

        // Draw card borders and place answers
        // IMPORTANT: Layout is symmetrical for double-sided printing
        let cardIndex = 0;
        for (let row = 0; row < cardsPerColumn; row++) {
            for (let col = 0; col < cardsPerRow; col++) {
                if (cardIndex >= cards.length) break;

                const x = pageMargin + col * (cardWidth + cardMargin);
                const y = pageMargin + (cardsPerColumn - 1 - row) * (cardHeight + cardMargin);

                // Draw card border
                stream += "0.8 0.8 0.8 rg\n"; // Light gray border
                stream += "1 w\n"; // Line width
                stream += x + " " + y + " m\n";
                stream += (x + cardWidth) + " " + y + " l\n";
                stream += (x + cardWidth) + " " + (y + cardHeight) + " l\n";
                stream += x + " " + (y + cardHeight) + " l\n";
                stream += x + " " + y + " l\n";
                stream += "S\n"; // Stroke path

                // Add answer text
                const answer = cards[cardIndex].answer || "";
                const textX = x + 10;
                const textY = y + cardHeight - 20;

                stream += "BT\n";
                stream += "/F1 " + fontSize + " Tf\n";
                stream += "0 0 0 rg\n"; // Black text
                stream += textX + " " + textY + " Td\n";
                stream += "(" + this.escapeText(answer) + ") Tj\n";
                stream += "ET\n";

                cardIndex++;
            }
        }

        return this.createContentStreamObject(stream);
    }

    /**
     * Create a PDF object
     */
    createObject(dict) {
        const objNum = this.objectCounter++;
        let content = objNum + " 0 obj\n";
        content += "<<\n";
        for (const [key, value] of Object.entries(dict)) {
            content += key + " " + value + "\n";
        }
        content += ">>\n";
        content += "endobj\n";
        return { content, objNum };
    }

    /**
     * Create content stream object
     */
    createContentStreamObject(stream) {
        const length = stream.length;
        const objNum = this.objectCounter++;
        let content = objNum + " 0 obj\n";
        content += "<<\n";
        content += "/Length " + length + "\n";
        content += ">>\n";
        content += "stream\n";
        content += stream;
        content += "endstream\n";
        content += "endobj\n";
        return { content, objNum, length };
    }

    /**
     * Get byte offset
     */
    getOffset(pdf, content) {
        return pdf.length - content.length;
    }

    /**
     * Escape special characters in PDF text
     */
    escapeText(text) {
        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FiszkiGenerator;
}

// For browser usage
if (typeof window !== 'undefined') {
    window.FiszkiGenerator = FiszkiGenerator;
}

