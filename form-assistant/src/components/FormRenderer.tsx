import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import type { DynamicFormSchema, Field } from '../types/form';
import { colors } from '../theme/colors';
import { buildZodSchema } from '../utils/validation';
import { Icon } from './Icon';

interface Props { schema: DynamicFormSchema; onSubmit(values: Record<string, string>): void }

type Errors = Record<string, string | undefined>;

export function FormRenderer({ schema, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [helpField, setHelpField] = useState<Field | null>(null);

  const zodSchema = useMemo(() => buildZodSchema(schema), [schema]);

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function renderLabel(field: Field) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: colors.textPrimary, flex: 1 }}>{field.label}</Text>
        {field.help_text && (
          <TouchableOpacity onPress={() => setHelpField(field)}>
            <Icon name="info" color={colors.neon} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderField(field: Field) {
    const error = errors[field.field_id];

    if (field.type === 'text' || field.type === 'date') {
      return (
        <View key={field.field_id} style={{ marginBottom: 16 }}>
          {renderLabel(field)}
          <TextInput
            value={values[field.field_id] ?? ''}
            onChangeText={(t) => setValue(field.field_id, t)}
            placeholder={field.help_text}
            placeholderTextColor={colors.textSecondary}
            style={{ borderWidth: 1, borderColor: error ? colors.danger : colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
          />
          {!!error && <Text style={{ color: colors.danger, marginTop: 6 }}>{error}</Text>}
        </View>
      );
    }

    if (field.type === 'single_choice') {
      const selected = values[field.field_id];
      const startError = errors[`${field.field_id}__start`];
      return (
        <View key={field.field_id} style={{ marginBottom: 16 }}>
          {renderLabel(field)}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {field.options.map((opt) => {
              const isActive = selected === opt.label;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setValue(field.field_id, opt.label)}
                  style={{
                    borderWidth: 1,
                    borderColor: isActive ? colors.neon : colors.border,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: isActive ? colors.neon : colors.textPrimary }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selected && field.options.find((o) => o.label === selected)?.requires_date && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>Startdatum</Text>
              <TextInput
                value={values[`${field.field_id}__start`]} 
                onChangeText={(t) => setValue(`${field.field_id}__start`, t)}
                placeholder={'dd.mm.yyyy'}
                placeholderTextColor={colors.textSecondary}
                style={{ borderWidth: 1, borderColor: startError ? colors.danger : colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
              />
              {!!startError && <Text style={{ color: colors.danger, marginTop: 6 }}>{startError}</Text>}
            </View>
          )}
          {!!error && <Text style={{ color: colors.danger, marginTop: 6 }}>{error}</Text>}
        </View>
      );
    }

    return null;
  }

  function validateAndSubmit() {
    const result = zodSchema.safeParse(values);
    if (!result.success) {
      const newErrors: Errors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || 'form';
        newErrors[path] = issue.message;
      }
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit(values);
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, marginBottom: 12 }}>{schema.title}</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>{schema.summary}</Text>
      {schema.fields.map(renderField)}
      <TouchableOpacity onPress={validateAndSubmit} style={{ backgroundColor: colors.neon, padding: 14, borderRadius: 12 }}>
        <Text>Submit</Text>
      </TouchableOpacity>

      <Modal transparent visible={!!helpField} animationType="fade" onRequestClose={() => setHelpField(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1a1a2b', padding: 16, borderRadius: 12, maxWidth: 520, width: '100%' }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, marginBottom: 8 }}>{helpField?.label}</Text>
            <Text style={{ color: colors.textSecondary }}>{helpField?.help_text}</Text>
            <TouchableOpacity onPress={() => setHelpField(null)} style={{ alignSelf: 'flex-end', marginTop: 12 }}>
              <Text style={{ color: colors.neon }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}