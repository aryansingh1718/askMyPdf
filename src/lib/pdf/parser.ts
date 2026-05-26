import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export interface ParsedPDF {
  text: string;
  numPages: number;
  fileName: string;
}

export async function parsePDF(filePath: string): Promise<ParsedPDF> {
  const absolutePath = path.resolve(filePath);
  const buffer = fs.readFileSync(absolutePath);
  const fileName = path.basename(filePath);

  const data = await pdfParse(buffer);

  return {
    text: data.text,
    numPages: data.numpages,
    fileName,
  };
}

export async function parsePDFFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ParsedPDF> {
  const data = await pdfParse(buffer);

  return {
    text: data.text,
    numPages: data.numpages,
    fileName,
  };
}