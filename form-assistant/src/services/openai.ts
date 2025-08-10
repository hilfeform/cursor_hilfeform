import type { DynamicFormSchema } from '../types/form';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function inferFormFromSituation(situation: string, locale: string): Promise<DynamicFormSchema> {
  // Placeholder: returns a minimal schema for now.
  return {
    form_id: 'antrag_kindergeld',
    language: locale,
    title: locale.startsWith('de') ? 'Kindergeld Antrag' : 'Child Benefit Application',
    summary:
      locale.startsWith('de')
        ? 'Dieses Formular dient der Beantragung von Kindergeld.'
        : 'This form is for applying for child benefit in Germany.',
    fields: [
      {
        field_id: 'familienstand',
        label: locale.startsWith('de') ? 'Familienstand' : 'Family Status',
        type: 'single_choice',
        options: [
          { label: 'Ledig', requires_date: false },
          { label: 'Verheiratet', requires_date: true },
          { label: 'Verpartnert', requires_date: true },
          { label: 'Geschieden', requires_date: true },
          { label: 'Verwitwet', requires_date: true },
          { label: 'Getrennt lebend', requires_date: true },
        ],
        validation: { required: true },
        help_text:
          locale.startsWith('de')
            ? 'Wählen Sie Ihren aktuellen Familienstand. Falls nicht ledig, geben Sie das Beginndatum an.'
            : 'Select your current family status. If not single, provide the date your current status began.',
      },
      {
        field_id: 'iban',
        label: 'IBAN',
        type: 'text',
        validation: { required: true, pattern: '^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$', format: 'iban' },
        help_text: locale.startsWith('de') ? 'Ihre IBAN von der Bankkarte.' : 'Your bank account number, found on your bank card.',
      },
      { field_id: 'kind_vorname', label: locale.startsWith('de') ? 'Vorname des Kindes' : "Child's First Name", type: 'text', validation: { required: true } },
      { field_id: 'kind_geburtsdatum', label: locale.startsWith('de') ? 'Geburtsdatum des Kindes' : "Child's Date of Birth", type: 'date', validation: { required: true, format: 'dd.mm.yyyy' } },
    ],
  };
}