import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import type { DynamicFormSchema } from '../types/form';
import { colors } from '../theme/colors';
import { extractPdfFieldNames } from '../utils/pdf';
import { Icon } from '../components/Icon';

interface Props { route: any; navigation: any }

export default function MappingScreen({ route, navigation }: Props) {
  const { schema, pdfUri, situation } = route.params as { schema: DynamicFormSchema; pdfUri: string; situation?: string };
  const [pdfFields, setPdfFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const file = await fetch(pdfUri);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const names = await extractPdfFieldNames(bytes);
        setPdfFields(names);
        // naive initial mapping: same names ignoring case/underscores
        const m: Record<string, string> = {};
        for (const f of schema.fields) {
          const match = names.find((n) => normalize(n) === normalize(f.field_id) || normalize(n) === normalize(f.label));
          if (match) m[f.field_id] = match;
        }
        setMapping(m);
      } finally {
        setLoading(false);
      }
    })();
  }, [pdfUri]);

  function normalize(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function selectForField(fieldId: string, name: string) {
    setMapping((m) => ({ ...m, [fieldId]: name }));
    setActiveField(null);
  }

  if (loading)
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.neon} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 22, marginBottom: 12 }}>Map fields</Text>
        {schema.fields.map((f) => (
          <View key={f.field_id} style={{ marginBottom: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: colors.textPrimary, marginBottom: 6 }}>{f.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>{mapping[f.field_id] ?? 'Unmapped'}</Text>
              <TouchableOpacity onPress={() => setActiveField(f.field_id)}>
                <Text style={{ color: colors.neon }}>Choose</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('FormFlow', { situation, pdfUri, mapping })}
          style={{ backgroundColor: colors.neon, padding: 14, borderRadius: 12, marginTop: 12 }}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={!!activeField} animationType="fade" onRequestClose={() => setActiveField(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#1a1a2b', borderRadius: 12, padding: 12, maxHeight: '70%' }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, marginBottom: 8 }}>Select PDF field</Text>
            <ScrollView>
              {pdfFields.map((name) => (
                <TouchableOpacity key={name} onPress={() => selectForField(activeField as string, name)} style={{ paddingVertical: 10 }}>
                  <Text style={{ color: colors.textSecondary }}>{name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setActiveField(null)} style={{ alignSelf: 'flex-end', marginTop: 12 }}>
              <Text style={{ color: colors.neon }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}