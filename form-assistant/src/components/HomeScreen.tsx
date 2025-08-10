import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Icon } from './Icon';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { NeonBox } from './NeonBox';
import { inferFormFromSituation } from '../services/openai';
import type { DynamicFormSchema } from '../types/form';
import { FormRenderer } from './FormRenderer';
import * as DocumentPicker from 'expo-document-picker';
import { isEditablePdf } from '../utils/pdf';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);

  async function handleSend() {
    setLoading(true);
    try {
      const s = await inferFormFromSituation(situation, i18n.language ?? 'en');
      setSchema(s);
      navigation.navigate('FormFlow', { situation });
    } finally {
      setLoading(false);
    }
  }

  async function handlePickDoc() {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    try {
      const file = await fetch(asset.uri);
      const buf = new Uint8Array(await file.arrayBuffer());
      const editable = await isEditablePdf(buf);
      Alert.alert('PDF detected', editable ? 'Editable PDF form' : 'Flat PDF');
    } catch (e) {
      Alert.alert('Error', 'Could not process the selected file.');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 54 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Montserrat_800ExtraBold' }}>H:</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Icon name="notifications" />
            <Icon name="more-vert" />
          </View>
        </View>

        <View style={{ marginTop: 36 }}>
          <Text style={[typography.heading1, { color: colors.neon }]}>{t('hello')}</Text>
          <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: 8 }]}>
            {t('prompt')}
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <NeonBox style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="attach-file" />
              <RNTextInput
                placeholder={t('explainPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={situation}
                onChangeText={setSituation}
                style={{ flex: 1, color: colors.textPrimary, marginHorizontal: 12, fontFamily: 'Montserrat_400Regular' }}
              />
              <TouchableOpacity onPress={handleSend} disabled={loading || situation.trim().length === 0}>
                {loading ? <ActivityIndicator color={colors.neon} /> : <Icon name="send" color={colors.neon} />}
              </TouchableOpacity>
            </View>
          </NeonBox>
        </View>

        {schema && (
          <View style={{ marginTop: 24 }}>
            <FormRenderer schema={schema} onSubmit={(v) => console.log('submit', v)} />
          </View>
        )}

        <View style={{ alignItems: 'center', marginVertical: 28 }}>
          <Text style={{ color: colors.neon, fontFamily: 'Montserrat_600SemiBold' }}>{t('or')}</Text>
        </View>

        <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={handlePickDoc}>
          <NeonBox style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="document-scanner" size={64} color={colors.neon} />
          </NeonBox>
          <Text style={{ color: colors.neon, marginTop: 12, fontFamily: 'Montserrat_600SemiBold' }}>{t('scanForm')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Icon name="home" color={colors.neon} size={28} />
        <Icon name="fact-check" size={28} />
        <View>
          <Icon name="folder" size={28} />
        </View>
      </View>
    </View>
  );
}