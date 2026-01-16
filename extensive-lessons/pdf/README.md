# PDF Manual Creation Guide

This guide explains how to manually create PDF files and manipulate colors, fonts, and text.

## Table of Contents
- [Color Commands](#color-commands)
- [Font Commands](#font-commands)
- [Text Positioning](#text-positioning)
- [Multi-Page PDFs](#multi-page-pdfs)
- [Examples](#examples)

---

## Color Commands

### Grayscale Colors

**Syntax:** `value g`

- `g` sets the **non-stroking** (fill) color in grayscale
- `G` sets the **stroking** (outline) color in grayscale
- Value range: `0.0` (black) to `1.0` (white)

**Examples:**
```
0 g        % Black (fill)
0.5 g      % Gray (fill)
1 g        % White (fill)
0 G        % Black (stroke)
0.5 G      % Gray (stroke)
```

### RGB Colors

**Syntax:** `r g b rg` (fill) or `r g b RG` (stroke)

- `rg` sets the **non-stroking** (fill) color in RGB
- `RG` sets the **stroking** (outline) color in RGB
- Each value range: `0.0` to `1.0`

**Examples:**
```
0 0 0 rg       % Black (fill)
1 1 1 rg       % White (fill)
1 0 0 rg       % Red (fill)
0 1 0 rg       % Green (fill)
0 0 1 rg       % Blue (fill)
1 1 0 rg       % Yellow (fill)
1 0 1 rg       % Magenta (fill)
0 1 1 rg       % Cyan (fill)
0.5 0.5 0.5 rg % Gray (fill)

1 0 0 RG       % Red (stroke)
0 1 0 RG       % Green (stroke)
```

### CMYK Colors

**Syntax:** `c m y k k` (fill) or `c m y k K` (stroke)

- `k` sets the **non-stroking** (fill) color in CMYK
- `K` sets the **stroking** (outline) color in CMYK
- Each value range: `0.0` to `1.0`

**Examples:**
```
0 0 0 1 k      % Black (fill)
0 0 0 0 k      % White (fill)
0 1 1 0 k      % Red (fill)
1 0 1 0 k      % Green (fill)
1 1 0 0 k      % Blue (fill)
```

---

## Font Commands

### Setting Font and Size

**Syntax:** `/FontName size Tf`

- `Tf` = Text font operator
- Font must be defined in `/Resources /Font` dictionary
- Size is in points (1 point = 1/72 inch)

**Examples:**
```
/F1 12 Tf      % Use font F1 at 12 points
/F1 24 Tf      % Use font F1 at 24 points
/F1 36 Tf      % Use font F1 at 36 points
/F2 18 Tf      % Use font F2 at 18 points
```

### Available Standard Fonts

PDF supports 14 standard Type1 fonts (no external files needed):

- `/Helvetica` - Sans-serif
- `/Helvetica-Bold`
- `/Helvetica-Oblique`
- `/Helvetica-BoldOblique`
- `/Times-Roman` - Serif
- `/Times-Bold`
- `/Times-Italic`
- `/Times-BoldItalic`
- `/Courier` - Monospace
- `/Courier-Bold`
- `/Courier-Oblique`
- `/Courier-BoldOblique`
- `/Symbol` - Special symbols
- `/ZapfDingbats` - Dingbats

**Font Definition Example:**
```
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
```

---

## Text Positioning

### Text Object Operators

**Begin/End Text:**
```
BT      % Begin Text object
ET      % End Text object
```

**Positioning:**
```
x y Td      % Move to position (x, y) - relative to current position
x y TD      % Move to position (x, y) and set leading
x y Tm      % Set text matrix (absolute positioning)
```

**Showing Text:**
```
(string) Tj     % Show text string
(string) '      % Show text and move to next line
(string) "      % Show text with word/character spacing
```

**Examples:**
```
BT
/F1 24 Tf           % Set font F1, size 24
100 700 Td          % Move to position (100, 700)
(Hello, World!) Tj  % Show text
ET
```

---

## Multi-Page PDFs

Creating PDFs with multiple pages requires additional Page objects and separate content streams for each page.

### Structure Differences

**Single Page PDF:**
```
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]      % One page reference
/Count 1            % One page
>>
endobj
```

**Multi-Page PDF:**
```
2 0 obj
<<
/Type /Pages
/Kids [3 0 R 4 0 R 5 0 R]  % Multiple page references
/Count 3                    % Number of pages
>>
endobj
```

### Key Components

1. **Pages Object**: Contains array of all page references in `/Kids`
2. **Page Objects**: Each page needs its own Page object
3. **Content Streams**: Each page needs its own Contents object
4. **Shared Resources**: Fonts and other resources can be shared across pages

### Example: 3-Page PDF Structure

```
% Catalog
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

% Pages object - lists all pages
2 0 obj
<<
/Type /Pages
/Kids [3 0 R 4 0 R 5 0 R]  % References to 3 page objects
/Count 3                    % Total page count
>>
endobj

% Page 1
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 6 0 R            % Page 1 content stream
/Resources <<
/Font <<
/F1 9 0 R                  % Shared font resource
>>
>>
>>
endobj

% Page 2
4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 7 0 R            % Page 2 content stream (different from page 1)
/Resources <<
/Font <<
/F1 9 0 R                  % Same font resource
>>
>>
>>
endobj

% Page 3
5 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 8 0 R            % Page 3 content stream
/Resources <<
/Font <<
/F1 9 0 R                  % Same font resource
>>
>>
>>
endobj

% Content stream for Page 1
6 0 obj
<<
/Length 50
>>
stream
BT
/F1 36 Tf
200 400 Td
(Page 1) Tj
ET
endstream
endobj

% Content stream for Page 2
7 0 obj
<<
/Length 50
>>
stream
BT
/F1 36 Tf
200 400 Td
(Page 2) Tj
ET
endstream
endobj

% Content stream for Page 3
8 0 obj
<<
/Length 50
>>
stream
BT
/F1 36 Tf
200 400 Td
(Page 3) Tj
ET
endstream
endobj

% Shared font resource (used by all pages)
9 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
```

### Important Notes

1. **Page Count**: The `/Count` in the Pages object must match the number of page references in `/Kids`

2. **Parent Reference**: Each Page object must reference the Pages object in `/Parent`

3. **Separate Content Streams**: Each page needs its own Contents object - you cannot share content streams between pages

4. **Resource Sharing**: Fonts, images, and other resources can be shared across pages by referencing the same object

5. **Object Counting**: Remember to update the `/Size` in the trailer to include all objects (Catalog, Pages, all Page objects, all Contents objects, all resource objects)

6. **Cross-Reference Table**: All objects must be listed in the xref table with correct byte offsets

### Adding More Pages

To add a 4th page:
1. Add `6 0 R` to the `/Kids` array: `[3 0 R 4 0 R 5 0 R 6 0 R]`
2. Change `/Count` to `4`
3. Create a new Page object (e.g., object 6)
4. Create a new Contents object for that page
5. Update the xref table and `/Size` in trailer

---

## Examples

### Example 1: Grayscale to RGB Conversion

**Grayscale (Black Rectangle):**
```
0 g                 % Set fill color to black (grayscale)
0 742 m             % Move to start position
595 742 l           % Draw line
595 842 l           % Draw line
0 842 l             % Draw line
f                   % Fill rectangle
```

**RGB Equivalent (Black Rectangle):**
```
0 0 0 rg            % Set fill color to black (RGB)
0 742 m             % Move to start position
595 742 l           % Draw line
595 842 l           % Draw line
0 842 l             % Draw line
f                   % Fill rectangle
```

**RGB Yellow Rectangle:**
```
1 1 0 rg            % Set fill color to yellow (RGB: red=1, green=1, blue=0)
0 742 m             % Move to start position
595 742 l           % Draw line
595 842 l           % Draw line
0 842 l             % Draw line
f                   % Fill rectangle
```

### Example 2: Different Font Sizes

```
BT
/F1 12 Tf           % Small text (12 points)
100 700 Td
(Small text) Tj

/F1 24 Tf           % Medium text (24 points)
100 650 Td
(Medium text) Tj

/F1 36 Tf           % Large text (36 points)
100 600 Td
(Large text) Tj
ET
```

### Example 3: Colored Text

```
BT
/F1 24 Tf           % Set font and size
1 0 0 rg            % Set text color to red (RGB)
100 700 Td          % Position
(Red Text) Tj       % Show text

0 1 0 rg            % Change color to green
100 650 Td          % New position
(Green Text) Tj     % Show text

0 0 1 rg            % Change color to blue
100 600 Td          % New position
(Blue Text) Tj      % Show text
ET
```

### Example 4: Multiple Fonts

**Font Definitions:**
```
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj

7 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>
endobj
```

**Using Multiple Fonts:**
```
BT
/F1 24 Tf           % Helvetica, 24pt
100 700 Td
(Helvetica Text) Tj

/F2 24 Tf           % Times-Roman, 24pt
100 650 Td
(Times-Roman Text) Tj

/F3 24 Tf           % Courier, 24pt
100 600 Td
(Courier Text) Tj
ET
```

### Example 5: Text with Background Box

```
% Draw yellow box
1 1 0 rg            % Yellow fill color
100 600 m           % Bottom-left corner
400 600 l           % Bottom-right corner
400 700 l           % Top-right corner
100 700 l           % Top-left corner
f                   % Fill

% Draw text on top
BT
/F1 24 Tf           % Font size 24
0 0 1 rg            % Blue text color
120 650 Td          % Position inside box
(Text in Box) Tj    % Show text
ET
```

---

## Complete PDF Structure

A minimal PDF file structure:

```
%PDF-1.4                    % PDF version header
1 0 obj ... endobj         % Catalog (root)
2 0 obj ... endobj         % Pages object
3 0 obj ... endobj         % Page object
4 0 obj ... endobj         % Content stream
5 0 obj ... endobj         % Font object (if using text)
xref ...                    % Cross-reference table
trailer ...                 % Trailer dictionary
startxref ...               % Offset to xref table
%%EOF                       % End of file
```

---

## Tips

1. **Color Space**: Always set color before drawing. Once set, it applies to all subsequent operations until changed.

2. **Text Positioning**: PDF coordinates start at bottom-left (0,0). Y increases upward.

3. **Font Resources**: Fonts must be defined in the `/Resources /Font` dictionary before use.

4. **Content Stream Length**: The `/Length` in the content stream object must match the actual byte count of the stream content.

5. **Cross-Reference Table**: Byte offsets in the xref table must be accurate for the PDF to open correctly.

6. **Multi-Page Documents**: Each page needs its own Page object and Contents object. The Pages object lists all pages in the `/Kids` array.

---

## Files in This Directory

- `hello-world.pdf` - Basic text example
- `hello-world-commented.pdf` - Same with detailed comments
- `a4-black-rectangle.pdf` - A4 page with black rectangle
- `a4-black-rectangle-commented.pdf` - Same with comments
- `yellow-box-text.pdf` - Yellow box with colored text
- `yellow-box-text-commented.pdf` - Same with comments
- `multi-page.pdf` - 3-page PDF example
- `multi-page-commented.pdf` - Same with detailed comments explaining multi-page structure

