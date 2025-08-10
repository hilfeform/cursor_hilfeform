import { PDFDocument } from 'pdf-lib';

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
  // For MVP, just write text at approximate positions is out of scope; return original.
  return fillPdf(bytes, fieldValues);
}