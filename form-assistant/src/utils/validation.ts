import { z, ZodObject } from 'zod';
import type { DynamicFormSchema, Field } from '../types/form';

export function buildZodSchema(schema: DynamicFormSchema): ZodObject<any> {
  const shape: Record<string, any> = {};

  for (const field of schema.fields) {
    let base = z.string().trim();

    if (field.validation?.required) {
      base = base.min(1, 'Required');
    } else {
      base = base.optional().transform((v) => (v ?? '')) as any;
    }

    if (field.validation?.pattern) {
      const re = new RegExp(field.validation.pattern);
      base = base.regex(re, 'Invalid format');
    }

    if (field.type === 'date' && field.validation?.format === 'dd.mm.yyyy') {
      base = base.regex(/^\d{2}\.\d{2}\.\d{4}$/g, 'Use dd.mm.yyyy');
    }

    shape[field.field_id] = base;

    if (field.type === 'single_choice') {
      // value must equal one of labels if provided
      const labels = field.options.map((o) => o.label);
      shape[field.field_id] = (field.validation?.required ? z.string() : z.string().optional()).refine(
        (v) => (v ? labels.includes(v) : true),
        'Invalid choice'
      );
      // If requires_date, add companion field `${id}__start`
      shape[`${field.field_id}__start`] = z
        .string()
        .optional()
        .refine((v) => !v || /^\d{2}\.\d{2}\.\d{4}$/.test(v), 'Use dd.mm.yyyy');
    }
  }

  return z.object(shape);
}