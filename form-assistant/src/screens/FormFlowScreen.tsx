import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { inferFormFromSituation } from '../services/openai';
import type { DynamicFormSchema } from '../types/form';
import { FormRenderer } from '../components/FormRenderer';
import { colors } from '../theme/colors';
import * as Localization from 'expo-localization';
import * as FileSystem from 'expo-file-system';
import { isEditablePdf, fillPdf, makeEditableAndFill, naiveMapValuesToPdfFields, saveAndSharePdf } from '../utils/pdf';

export default function FormFlowScreen({ route }: any) {
  const { situation, pdfUri } = route.params as { situation?: string; pdfUri?: string };
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);

  useEffect(() => {
    if (!situation) return;
    void (async () => {
      const s = await inferFormFromSituation(situation, Localization.getLocales()[0]?.languageCode ?? 'en');
      setSchema(s);
    })();
  }, [situation]);

  if (!schema)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.neon} />
      </View>
    );

  async function onSubmit(values: Record<string, string>) {
    try {
      if (!pdfUri) {
        Alert.alert('Form submitted', 'No PDF selected yet.');
        return;
      }
      const res = await fetch(pdfUri);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const mapped = naiveMapValuesToPdfFields(values);
      const editable = await isEditablePdf(bytes);
      const filled = editable ? await fillPdf(bytes, mapped) : await makeEditableAndFill(bytes, mapped);
      await saveAndSharePdf(filled);
    } catch (e) {
      Alert.alert('Error', 'Could not fill or share the PDF.');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormRenderer schema={schema} onSubmit={onSubmit} />
    </View>
  );
}