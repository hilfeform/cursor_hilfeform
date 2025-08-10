import type { DynamicFormSchema } from '../types/form';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const systemPrompt = `You create JSON form schemas for German public authority forms. Use fields: field_id, label, type (text|date|single_choice), options (for single_choice with requires_date boolean), validation (required, pattern, format), help_text. Return strictly JSON.`;

export async function inferFormFromSituation(situation: string, locale: string): Promise<DynamicFormSchema> {
  if (!OPENAI_API_KEY) return fallbackSchema(locale);
  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Locale: ${locale}. Situation: ${situation}` },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'dynamic_form_schema',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                form_id: { type: 'string' },
                language: { type: 'string' },
                title: { type: 'string' },
                summary: { type: 'string' },
                fields: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field_id: { type: 'string' },
                      label: { type: 'string' },
                      type: { enum: ['text', 'date', 'single_choice'] },
                      options: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            label: { type: 'string' },
                            requires_date: { type: 'boolean' },
                          },
                          required: ['label'],
                        },
                      },
                      validation: {
                        type: 'object',
                        properties: {
                          required: { type: 'boolean' },
                          pattern: { type: 'string' },
                          format: { type: 'string' },
                        },
                      },
                      help_text: { type: 'string' },
                    },
                    required: ['field_id', 'label', 'type'],
                  },
                },
              },
              required: ['form_id', 'language', 'title', 'summary', 'fields'],
            },
          },
        },
      }),
    });
    const data = await res.json();
    const text = data?.output?.[0]?.content?.[0]?.text ?? data?.choices?.[0]?.message?.content ?? data?.output_text;
    const parsed: DynamicFormSchema = JSON.parse(text);
    return parsed;
  } catch (e) {
    return fallbackSchema(locale);
  }
}

function fallbackSchema(locale: string): DynamicFormSchema {
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