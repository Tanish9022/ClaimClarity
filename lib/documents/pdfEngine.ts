/**
 * LIGHTWEIGHT PURE TYPESCRIPT PDF 1.4 ENGINE
 * Deterministic in-memory PDF generation without external binaries or network dependencies.
 */

export interface PDFPageOptions {
  width?: number;
  height?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const PDFColors = {
  black: { r: 0.1, g: 0.12, b: 0.15 },
  darkGray: { r: 0.3, g: 0.35, b: 0.4 },
  lightGray: { r: 0.92, g: 0.94, b: 0.96 },
  borderGray: { r: 0.8, g: 0.83, b: 0.86 },
  white: { r: 1, g: 1, b: 1 },
  primary: { r: 0.08, g: 0.35, b: 0.65 },
  successGreen: { r: 0.1, g: 0.55, b: 0.3 },
  successGreenBg: { r: 0.93, g: 0.98, b: 0.95 },
  warningAmber: { r: 0.85, g: 0.45, b: 0.05 },
  warningAmberBg: { r: 1, g: 0.96, b: 0.9 },
  cardBg: { r: 0.97, g: 0.98, b: 0.99 }
};

export class PDFDocumentBuilder {
  private pages: string[] = [];
  private currentPageContent: string[] = [];
  private currentY: number;
  readonly pageWidth: number;
  readonly pageHeight: number;
  readonly marginLeft: number;
  readonly marginRight: number;
  readonly marginTop: number;
  readonly marginBottom: number;
  readonly contentWidth: number;

  constructor(options: PDFPageOptions = {}) {
    this.pageWidth = options.width || 595.28; // Standard A4 points
    this.pageHeight = options.height || 841.89;
    this.marginLeft = options.marginLeft || 40;
    this.marginRight = options.marginRight || 40;
    this.marginTop = options.marginTop || 50;
    this.marginBottom = options.marginBottom || 50;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.currentY = this.pageHeight - this.marginTop;
  }

  private escapePDFText(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      // Replace non-ASCII characters with safe transliterations/representations for Standard Type 1 Helvetica font
      .replace(/[\u20B9]/g, "Rs. ")
      .replace(/[\u2014\u2013]/g, "-")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2026]/g, "...")
      .replace(/[^\x20-\x7E]/g, "?");
  }

  public newPage(): void {
    if (this.currentPageContent.length > 0) {
      this.pages.push(this.currentPageContent.join("\n"));
      this.currentPageContent = [];
    }
    this.currentY = this.pageHeight - this.marginTop;
  }

  public ensureSpace(requiredHeight: number): void {
    if (this.currentY - requiredHeight < this.marginBottom) {
      this.newPage();
    }
  }

  public setFillColor(color: RGBColor): void {
    this.currentPageContent.push(`${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg`);
  }

  public setStrokeColor(color: RGBColor): void {
    this.currentPageContent.push(`${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} RG`);
  }

  public drawRect(x: number, y: number, width: number, height: number, fill = true, stroke = true): void {
    this.currentPageContent.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`);
    if (fill && stroke) {
      this.currentPageContent.push("B");
    } else if (fill) {
      this.currentPageContent.push("f");
    } else if (stroke) {
      this.currentPageContent.push("S");
    }
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth = 1): void {
    this.currentPageContent.push(`${lineWidth} w`);
    this.currentPageContent.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m`);
    this.currentPageContent.push(`${x2.toFixed(2)} ${y2.toFixed(2)} l`);
    this.currentPageContent.push("S");
  }

  public addText(
    text: string,
    x: number,
    y: number,
    fontSize = 10,
    font = "F1", // F1 = Helvetica, F2 = Helvetica-Bold, F3 = Helvetica-Oblique
    color: RGBColor = PDFColors.black
  ): void {
    const escaped = this.escapePDFText(text);
    this.currentPageContent.push("BT");
    this.currentPageContent.push(`/${font} ${fontSize} Tf`);
    this.setFillColor(color);
    this.currentPageContent.push(`${x.toFixed(2)} ${y.toFixed(2)} Td`);
    this.currentPageContent.push(`(${escaped}) Tj`);
    this.currentPageContent.push("ET");
  }

  public addWrappedText(
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    fontSize = 9,
    font = "F1",
    color: RGBColor = PDFColors.black,
    lineHeight = fontSize * 1.35
  ): number {
    const words = text.split(" ");
    let currentLine = "";
    let y = startY;

    // Approximate character width in standard Helvetica: ~0.55 * fontSize
    const avgCharWidth = fontSize * 0.52;
    const maxCharsPerLine = Math.max(10, Math.floor(maxWidth / avgCharWidth));

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length > maxCharsPerLine && currentLine) {
        this.addText(currentLine, x, y, fontSize, font, color);
        y -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      this.addText(currentLine, x, y, fontSize, font, color);
      y -= lineHeight;
    }

    return y;
  }

  public addSectionHeading(title: string): void {
    this.ensureSpace(35);
    this.currentY -= 8;
    this.setFillColor(PDFColors.primary);
    this.drawRect(this.marginLeft, this.currentY - 14, this.contentWidth, 18, true, false);
    this.addText(title.toUpperCase(), this.marginLeft + 8, this.currentY - 10, 9, "F2", PDFColors.white);
    this.currentY -= 24;
  }

  public addCalloutBox(
    title: string,
    body: string,
    type: "success" | "warning" | "info" = "info"
  ): void {
    const boxWidth = this.contentWidth;
    const padding = 8;
    const fontSize = 8.5;
    const lineHeight = 11;
    const approxLines = Math.ceil(body.length / 85) + 1;
    const boxHeight = 16 + approxLines * lineHeight + 12;

    this.ensureSpace(boxHeight + 10);

    const bgColor =
      type === "success"
        ? PDFColors.successGreenBg
        : type === "warning"
        ? PDFColors.warningAmberBg
        : PDFColors.cardBg;
    const borderColor =
      type === "success"
        ? PDFColors.successGreen
        : type === "warning"
        ? PDFColors.warningAmber
        : PDFColors.borderGray;

    this.setFillColor(bgColor);
    this.setStrokeColor(borderColor);
    this.drawRect(this.marginLeft, this.currentY - boxHeight, boxWidth, boxHeight, true, true);

    // Left accent bar
    this.setFillColor(borderColor);
    this.drawRect(this.marginLeft, this.currentY - boxHeight, 4, boxHeight, true, false);

    // Title
    this.addText(
      title,
      this.marginLeft + padding + 4,
      this.currentY - 14,
      9,
      "F2",
      type === "warning" ? PDFColors.warningAmber : type === "success" ? PDFColors.successGreen : PDFColors.primary
    );

    // Body text wrapped
    this.addWrappedText(
      body,
      this.marginLeft + padding + 4,
      this.currentY - 26,
      boxWidth - (padding * 2 + 8),
      fontSize,
      "F1",
      PDFColors.black,
      lineHeight
    );

    this.currentY -= boxHeight + 10;
  }

  public addTable(
    headers: string[],
    columnWidths: number[],
    rows: string[][]
  ): void {
    const rowHeight = 18;
    const headerHeight = 16;
    const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);

    this.ensureSpace(headerHeight + rowHeight * Math.min(rows.length, 3) + 10);

    // Header Background
    this.setFillColor(PDFColors.lightGray);
    this.setStrokeColor(PDFColors.borderGray);
    this.drawRect(this.marginLeft, this.currentY - headerHeight, totalTableWidth, headerHeight, true, true);

    let curX = this.marginLeft;
    headers.forEach((header, idx) => {
      this.addText(header, curX + 4, this.currentY - 11, 7.5, "F2", PDFColors.black);
      curX += columnWidths[idx];
    });

    this.currentY -= headerHeight;

    // Rows
    rows.forEach((row, rowIdx) => {
      // Calculate row height based on content
      let maxCellLines = 1;
      row.forEach((cell, cellIdx) => {
        const width = columnWidths[cellIdx];
        const chars = Math.floor(width / 4.2);
        const lines = Math.ceil(cell.length / chars);
        if (lines > maxCellLines) maxCellLines = lines;
      });

      const actualRowHeight = Math.max(rowHeight, maxCellLines * 10 + 6);
      this.ensureSpace(actualRowHeight + 5);

      // Alternating row background
      if (rowIdx % 2 === 1) {
        this.setFillColor(PDFColors.cardBg);
        this.drawRect(this.marginLeft, this.currentY - actualRowHeight, totalTableWidth, actualRowHeight, true, false);
      }

      // Row border
      this.setStrokeColor(PDFColors.borderGray);
      this.drawLine(this.marginLeft, this.currentY - actualRowHeight, this.marginLeft + totalTableWidth, this.currentY - actualRowHeight, 0.5);

      curX = this.marginLeft;
      row.forEach((cell, cellIdx) => {
        const colW = columnWidths[cellIdx];
        this.addWrappedText(
          cell,
          curX + 4,
          this.currentY - 9,
          colW - 8,
          7,
          "F1",
          PDFColors.black,
          9
        );
        curX += colW;
      });

      this.currentY -= actualRowHeight;
    });

    this.currentY -= 8;
  }

  public build(): Buffer {
    if (this.currentPageContent.length > 0) {
      this.pages.push(this.currentPageContent.join("\n"));
    }

    const totalPages = Math.max(1, this.pages.length);
    const objects: string[] = [];

    // 1. Catalog
    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

    // 2. Pages Root (Kids array filled later)
    const pageObjStartId = 3;
    const fontObjId1 = pageObjStartId + totalPages * 2;
    const fontObjId2 = fontObjId1 + 1;
    const fontObjId3 = fontObjId2 + 1;
    const infoObjId = fontObjId3 + 1;

    const kids = Array.from({ length: totalPages }, (_, i) => `${pageObjStartId + i * 2} 0 R`).join(" ");
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${totalPages} >>\nendobj`);

    // Add running header & footer to each page stream
    this.pages.forEach((pageContent, idx) => {
      const pageNum = idx + 1;
      const pageObjId = pageObjStartId + idx * 2;
      const contentObjId = pageObjId + 1;

      // Running Header & Footer
      const headerFooterStream = [
        "BT",
        "/F2 7.5 Tf",
        "0.300 0.350 0.400 rg",
        `${this.marginLeft.toFixed(2)} ${(this.pageHeight - 25).toFixed(2)} Td`,
        "(CLAIMCLARITY EVIDENCE & GRIEVANCE SUPPORT DOSSIER) Tj",
        "ET",
        // Header line
        "0.800 0.830 0.860 RG",
        "0.5 w",
        `${this.marginLeft.toFixed(2)} ${(this.pageHeight - 30).toFixed(2)} m`,
        `${(this.pageWidth - this.marginRight).toFixed(2)} ${(this.pageHeight - 30).toFixed(2)} l`,
        "S",
        // Footer line
        `${this.marginLeft.toFixed(2)} 35.00 m`,
        `${(this.pageWidth - this.marginRight).toFixed(2)} 35.00 l`,
        "S",
        // Footer text
        "BT",
        "/F3 7 Tf",
        "0.400 0.450 0.500 rg",
        `${this.marginLeft.toFixed(2)} 24.00 Td`,
        "(Prepared by ClaimClarity as an independent evidence aid. Not an official EPFO document.) Tj",
        "ET",
        // Page number
        "BT",
        "/F2 7.5 Tf",
        "0.300 0.350 0.400 rg",
        `${(this.pageWidth - this.marginRight - 45).toFixed(2)} 24.00 Td`,
        `(${this.escapePDFText(`Page ${pageNum} of ${totalPages}`)}) Tj`,
        "ET",
        pageContent
      ].join("\n");

      const streamBytes = Buffer.from(headerFooterStream, "utf-8");

      // Page Object
      objects.push(
        `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pageWidth.toFixed(2)} ${this.pageHeight.toFixed(2)}] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId1} 0 R /F2 ${fontObjId2} 0 R /F3 ${fontObjId3} 0 R >> >> >>\nendobj`
      );

      // Contents Stream Object
      objects.push(
        `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${headerFooterStream}\nendstream\nendobj`
      );
    });

    // Font 1: Helvetica
    objects.push(`${fontObjId1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

    // Font 2: Helvetica-Bold
    objects.push(`${fontObjId2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);

    // Font 3: Helvetica-Oblique
    objects.push(`${fontObjId3} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj`);

    // Info Object
    const dateStr = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    objects.push(
      `${infoObjId} 0 obj\n<< /Title (ClaimClarity Evidence & Grievance Support Dossier) /Author (ClaimClarity) /Subject (EPFO Claim Evidence Dossier) /CreationDate (D:${dateStr}Z) >>\nendobj`
    );

    // Build Byte Assembly with valid cross-reference table (xref)
    let body = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const xrefOffsets: number[] = [0];

    for (let i = 0; i < objects.length; i++) {
      xrefOffsets.push(Buffer.byteLength(body, "utf-8"));
      body += objects[i] + "\n";
    }

    const startXref = Buffer.byteLength(body, "utf-8");
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

    for (let i = 1; i <= objects.length; i++) {
      const offset = xrefOffsets[i].toString().padStart(10, "0");
      xref += `${offset} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjId} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.from(body + xref + trailer, "utf-8");
  }
}
