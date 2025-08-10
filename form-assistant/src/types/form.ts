export type SingleChoiceOption = {
  label: string;
  requires_date?: boolean;
};

export type FieldBase = {
  field_id: string;
  label: string;
  help_text?: string;
  validation?: {
    required?: boolean;
    pattern?: string;
    format?: 'iban' | 'email' | 'dd.mm.yyyy' | string;
  };
};

export type Field =
  | (FieldBase & { type: 'text' })
  | (FieldBase & { type: 'date' })
  | (FieldBase & { type: 'single_choice'; options: SingleChoiceOption[] });

export interface DynamicFormSchema {
  form_id: string;
  language: string;
  title: string;
  summary: string;
  fields: Field[];
}