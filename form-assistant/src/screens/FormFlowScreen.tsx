import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { inferFormFromSituation } from '../services/openai';
import type { DynamicFormSchema } from '../types/form';
import { FormRenderer } from '../components/FormRenderer';
import { colors } from '../theme/colors';
import * as Localization from 'expo-localization';
import { isEditablePdf, fillPdf, makeEditableAndFill, naiveMapValuesToPdfFields, saveAndSharePdf } from '../utils/pdf';

export default function FormFlowScreen({ route, navigation }: any) {
  const { situation, pdfUri, mapping } = route.params as { situation?: string; pdfUri?: string; mapping?: Record<string, string> };
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);

  useEffect(() => {
    if (!situation) return;
    void (async () => {
      const s = await inferFormFromSituation(situation, Localization.getLocales()[0]?.languageCode ?? 'en');
      setSchema(s);
    })();
  }, [situation]);

  const effectiveMapping = useMemo(() => mapping ?? {}, [mapping]);

  async function onSubmit(values: Record<string, string>) {
    try {
      if (!pdfUri) {
        Alert.alert('Form submitted', 'No PDF selected yet.');
        return;
      }
      const res = await fetch(pdfUri);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const sourceMap = Object.keys(effectiveMapping).length > 0 ?
        Object.fromEntries(Object.entries(values).map(([k, v]) => [effectiveMapping[k] ?? k, v])) :
        naiveMapValuesToPdfFields(values);
      const editable = await isEditablePdf(bytes);
      const filled = editable ? await fillPdf(bytes, sourceMap) : await makeEditableAndFill(bytes, sourceMap);
      await saveAndSharePdf(filled);
    } catch (e) {
      Alert.alert('Error', 'Could not fill or share the PDF.');
    }
  }

  if (!schema)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.neon} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {pdfUri && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Mapping', { schema, pdfUri, situation })}
          style={{ alignSelf: 'flex-end', margin: 12 }}
        >
          <Text style={{ color: colors.neon }}>Map PDF fields</Text>
        </TouchableOpacity>
      )}
      <FormRenderer schema={schema} onSubmit={onSubmit} />
    </View>
  );
}