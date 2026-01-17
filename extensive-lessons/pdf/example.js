/**
 * Simple PDF Generator
 * 
 * This is a minimal PDF generator showing the essential components that cannot be omitted.
 * Generates valid PDF files with text and/or graphics.
 */

class SimplePDFGenerator {
    constructor() {
        this.objects = [];
        this.objectCounter = 1; // Start at 1 (object 0 is free)
        this.offsets = []; // Track byte offsets for xref table
    }

    /**
     * Generate a PDF with text content
     * @param {Object} options - PDF options
     * @param {string} options.text - Text to display
     * @param {number} options.fontSize - Font size in points (default: 24)
     * @param {number} options.x - X position (default: 100)
     * @param {number} options.y - Y position (default: 700)
     * @param {Array<number>} options.textColor - RGB color [r, g, b] (default: [0, 0, 0] = black)
     * @param {Array<number>} options.pageSize - Page size [width, height] (default: [595, 842] = A4)
     * @returns {string} - Complete PDF content
     */
    generateTextPDF(options = {}) {
        const {
            text = "Hello, World!",
            fontSize = 24,
            x = 100,
            y = 700,
            textColor = [0, 0, 0], // Black
            pageSize = [595, 842] // A4
        } = options;

        // Reset for new PDF
        this.objects = [];
        this.objectCounter = 1;
        this.offsets = [];

        // ESSENTIAL: PDF header - cannot be omitted
        let pdf = "%PDF-1.4\n";

        // ESSENTIAL: Catalog object (object 1) - root of document, cannot be omitted
        const catalogObj = this.createObject({
            "/Type": "/Catalog",
            "/Pages": "2 0 R" // Reference to Pages object
        });
        pdf += catalogObj.content;
        this.offsets.push({ num: 1, offset: pdf.length - catalogObj.content.length });

        // ESSENTIAL: Pages object (object 2) - lists all pages, cannot be omitted
        const pagesObj = this.createObject({
            "/Type": "/Pages",
            "/Kids": "[3 0 R]", // Reference to Page object
            "/Count": "1" // Number of pages
        });
        pdf += pagesObj.content;
        this.offsets.push({ num: 2, offset: pdf.length - pagesObj.content.length });

        // ESSENTIAL: Page object (object 3) - defines a single page, cannot be omitted
        const pageObj = this.createObject({
            "/Type": "/Page",
            "/Parent": "2 0 R", // Reference back to Pages object
            "/MediaBox": `[0 0 ${pageSize[0]} ${pageSize[1]}]`, // Page size
            "/Contents": "4 0 R", // Reference to content stream
            "/Resources": "<<\n/Font <<\n/F1 5 0 R\n>>\n>>" // Font resources
        });
        pdf += pageObj.content;
        this.offsets.push({ num: 3, offset: pdf.length - pageObj.content.length });

        // ESSENTIAL: Content stream (object 4) - actual page content, cannot be omitted
        const contentStream = this.createTextContentStream(text, fontSize, x, y, textColor);
        pdf += contentStream.content;
        this.offsets.push({ num: 4, offset: pdf.length - contentStream.content.length });

        // ESSENTIAL: Font object (object 5) - required for text, cannot be omitted if using text
        const fontObj = this.createObject({
            "/Type": "/Font",
            "/Subtype": "/Type1",
            "/BaseFont": "/Helvetica" // Standard font, no external file needed
        });
        pdf += fontObj.content;
        this.offsets.push({ num: 5, offset: pdf.length - fontObj.content.length });

        // ESSENTIAL: Cross-reference table - cannot be omitted, required for PDF structure
        const xrefStart = pdf.length;
        pdf += "xref\n";
        pdf += "0 " + (this.objectCounter) + "\n"; // First object number, count
        pdf += "0000000000 65535 f \n"; // Free object (object 0)
        
        // Add offsets for all objects
        for (let i = 1; i < this.objectCounter; i++) {
            const offset = this.offsets.find(o => o.num === i)?.offset || 0;
            pdf += String(offset).padStart(10, '0') + " 00000 n \n";
        }

        // ESSENTIAL: Trailer - cannot be omitted, contains document metadata
        pdf += "trailer\n";
        pdf += "<<\n";
        pdf += "/Size " + this.objectCounter + "\n"; // Total number of objects
        pdf += "/Root 1 0 R\n"; // Reference to Catalog (object 1)
        pdf += ">>\n";

        // ESSENTIAL: startxref - cannot be omitted, points to xref table
        pdf += "startxref\n";
        pdf += xrefStart + "\n";

        // ESSENTIAL: End of file marker - cannot be omitted
        pdf += "%%EOF";

        return pdf;
    }

    /**
     * Generate a PDF with a colored rectangle
     * @param {Object} options - PDF options
     * @param {Array<number>} options.rect - Rectangle [x, y, width, height]
     * @param {Array<number>} options.color - RGB color [r, g, b] (default: [0, 0, 0] = black)
     * @param {Array<number>} options.pageSize - Page size [width, height] (default: [595, 842] = A4)
     * @returns {string} - Complete PDF content
     */
    generateRectanglePDF(options = {}) {
        const {
            rect = [100, 600, 400, 100], // [x, y, width, height]
            color = [0, 0, 0], // Black
            pageSize = [595, 842] // A4
        } = options;

        // Reset for new PDF
        this.objects = [];
        this.objectCounter = 1;
        this.offsets = [];

        let pdf = "%PDF-1.4\n";

        // Catalog
        const catalogObj = this.createObject({
            "/Type": "/Catalog",
            "/Pages": "2 0 R"
        });
        pdf += catalogObj.content;
        this.offsets.push({ num: 1, offset: pdf.length - catalogObj.content.length });

        // Pages
        const pagesObj = this.createObject({
            "/Type": "/Pages",
            "/Kids": "[3 0 R]",
            "/Count": "1"
        });
        pdf += pagesObj.content;
        this.offsets.push({ num: 2, offset: pdf.length - pagesObj.content.length });

        // Page (no font resources needed for graphics only)
        const pageObj = this.createObject({
            "/Type": "/Page",
            "/Parent": "2 0 R",
            "/MediaBox": `[0 0 ${pageSize[0]} ${pageSize[1]}]`,
            "/Contents": "4 0 R",
            "/Resources": "<<" // Empty resources - no fonts needed
        });
        pdf += pageObj.content;
        this.offsets.push({ num: 3, offset: pdf.length - pageObj.content.length });

        // Content stream with rectangle
        const [x, y, width, height] = rect;
        const contentStream = this.createRectangleContentStream(x, y, width, height, color);
        pdf += contentStream.content;
        this.offsets.push({ num: 4, offset: pdf.length - contentStream.content.length });

        // Cross-reference table
        const xrefStart = pdf.length;
        pdf += "xref\n";
        pdf += "0 " + (this.objectCounter) + "\n";
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
     * Create a PDF object (internal helper)
     * ESSENTIAL: All PDF data is stored in objects with this structure
     */
    createObject(dict) {
        const objNum = this.objectCounter++;
        let content = `${objNum} 0 obj\n`;
        content += "<<\n";
        
        for (const [key, value] of Object.entries(dict)) {
            content += `${key} ${value}\n`;
        }
        
        content += ">>\n";
        content += "endobj\n";
        
        return { content, objNum };
    }

    /**
     * Create content stream for text
     * ESSENTIAL: Content streams contain the actual page content (text, graphics)
     */
    createTextContentStream(text, fontSize, x, y, color) {
        const [r, g, b] = color;
        
        // Build content stream
        let stream = "BT\n"; // Begin Text
        stream += `/F1 ${fontSize} Tf\n`; // Set font and size
        stream += `${r} ${g} ${b} rg\n`; // Set text color (RGB)
        stream += `${x} ${y} Td\n`; // Move to position
        stream += `(${this.escapeText(text)}) Tj\n`; // Show text
        stream += "ET\n"; // End Text
        
        const length = stream.length;
        
        const objNum = this.objectCounter++;
        let content = `${objNum} 0 obj\n`;
        content += "<<\n";
        content += `/Length ${length}\n`; // ESSENTIAL: Must match stream byte length
        content += ">>\n";
        content += "stream\n";
        content += stream;
        content += "endstream\n";
        content += "endobj\n";
        
        return { content, objNum, length };
    }

    /**
     * Create content stream for rectangle
     */
    createRectangleContentStream(x, y, width, height, color) {
        const [r, g, b] = color;
        const x2 = x + width;
        const y2 = y + height;
        
        let stream = `${r} ${g} ${b} rg\n`; // Set fill color (RGB)
        stream += `${x} ${y} m\n`; // Move to bottom-left
        stream += `${x2} ${y} l\n`; // Line to bottom-right
        stream += `${x2} ${y2} l\n`; // Line to top-right
        stream += `${x} ${y2} l\n`; // Line to top-left
        stream += "f\n"; // Fill path
        
        const length = stream.length;
        
        const objNum = this.objectCounter++;
        let content = `${objNum} 0 obj\n`;
        content += "<<\n";
        content += `/Length ${length}\n`;
        content += ">>\n";
        content += "stream\n";
        content += stream;
        content += "endstream\n";
        content += "endobj\n";
        
        return { content, objNum, length };
    }

    /**
     * Escape special characters in PDF text strings
     */
    escapeText(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Simple text PDF
function example1() {
    const generator = new SimplePDFGenerator();
    const pdf = generator.generateTextPDF({
        text: "Hello, World!",
        fontSize: 24,
        x: 100,
        y: 700,
        textColor: [0, 0, 0] // Black
    });
    
    // In Node.js: require('fs').writeFileSync('output.pdf', pdf);
    // In browser: download as blob
    console.log("PDF generated:", pdf.length, "bytes");
    return pdf;
}

// Example 2: Colored text
function example2() {
    const generator = new SimplePDFGenerator();
    const pdf = generator.generateTextPDF({
        text: "Red Text",
        fontSize: 36,
        x: 200,
        y: 400,
        textColor: [1, 0, 0] // Red
    });
    return pdf;
}

// Example 3: Yellow rectangle
function example3() {
    const generator = new SimplePDFGenerator();
    const pdf = generator.generateRectanglePDF({
        rect: [100, 600, 400, 100], // x, y, width, height
        color: [1, 1, 0] // Yellow
    });
    return pdf;
}

// Example 4: Custom page size (US Letter)
function example4() {
    const generator = new SimplePDFGenerator();
    const pdf = generator.generateTextPDF({
        text: "US Letter Size",
        pageSize: [612, 792] // US Letter: 8.5 x 11 inches
    });
    return pdf;
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimplePDFGenerator;
}

// For browser usage
if (typeof window !== 'undefined') {
    window.SimplePDFGenerator = SimplePDFGenerator;
}

