import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function isEditablePdf(bytes: Uint8Array): Promise<boolean> {
  try {
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    return form.getFields().length > 0;
  } catch {
    return false;
  }
}

export async function fillPdf(bytes: Uint8Array, fieldValues: Record<string, string | undefined>): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  for (const field of form.getFields()) {
    const name = field.getName();
    const value = fieldValues[name];
    if (value == null) continue;
    if (typeof (field as any).setText === 'function') {
      (field as any).setText(String(value));
    }
  }
  form.updateFieldAppearances();
  return await pdfDoc.save();
}

export async function makeEditableAndFill(bytes: Uint8Array, fieldValues: Record<string, string | undefined>): Promise<Uint8Array> {
  // For MVP, reuse fill path; flat PDFs may not fill. Later: drawText at coordinates.
  return fillPdf(bytes, fieldValues);
}

export function naiveMapValuesToPdfFields(values: Record<string, string>): Record<string, string> {
  // Naive key mapping: direct pass-through; later enhance with AI suggestions and fuzzy mapping
  return values;
}

export async function saveAndSharePdf(bytes: Uint8Array, filename = 'filled-form.pdf') {
  const fileUri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, Buffer.from(bytes).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
  return fileUri;
}

export async function extractPdfFieldNames(bytes: Uint8Array): Promise<string[]> {
  try {
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    return form.getFields().map((f) => f.getName());
  } catch {
    return [];
  }
}