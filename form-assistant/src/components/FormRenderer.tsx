import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import type { DynamicFormSchema, Field } from '../types/form';
import { colors } from '../theme/colors';

interface Props { schema: DynamicFormSchema; onSubmit(values: Record<string, string>): void }

export function FormRenderer({ schema, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function renderField(field: Field) {
    if (field.type === 'text' || field.type === 'date') {
      return (
        <View key={field.field_id} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>{field.label}</Text>
          <TextInput
            value={values[field.field_id] ?? ''}
            onChangeText={(t) => setValue(field.field_id, t)}
            placeholder={field.help_text}
            placeholderTextColor={colors.textSecondary}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
          />
        </View>
      );
    }

    if (field.type === 'single_choice') {
      const selected = values[field.field_id];
      return (
        <View key={field.field_id} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>{field.label}</Text>
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
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
              />
            </View>
          )}
        </View>
      );
    }

    return null;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, marginBottom: 12 }}>{schema.title}</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>{schema.summary}</Text>
      {schema.fields.map(renderField)}
      <TouchableOpacity onPress={() => onSubmit(values)} style={{ backgroundColor: colors.neon, padding: 14, borderRadius: 12 }}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}