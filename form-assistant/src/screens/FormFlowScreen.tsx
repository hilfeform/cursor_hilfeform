import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { inferFormFromSituation } from '../services/openai';
import type { DynamicFormSchema } from '../types/form';
import { FormRenderer } from '../components/FormRenderer';
import { colors } from '../theme/colors';
import * as Localization from 'expo-localization';

export default function FormFlowScreen({ route }: any) {
  const { situation } = route.params as { situation: string };
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);

  useEffect(() => {
    void (async () => {
      const s = await inferFormFromSituation(situation, Localization.getLocales()[0]?.languageCode ?? 'en');
      setSchema(s);
    })();
  }, [situation]);

  if (!schema) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.neon} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormRenderer schema={schema} onSubmit={(v) => console.log('submit', v)} />
    </View>
  );
}