import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.lastUpdated}>Última atualização: 26 de março de 2026</Text>

          <Text style={styles.intro}>
            O ScanPDF ("aplicativo", "nós") respeita sua privacidade. Esta Política de Privacidade
            descreve como coletamos, usamos e protegemos suas informações ao utilizar nosso aplicativo.
          </Text>

          <Section title="1. Informações Coletadas">
            <Paragraph>
              O ScanPDF é um aplicativo de digitalização de documentos que funciona localmente no seu
              dispositivo. Nós não coletamos, armazenamos nem transmitimos dados pessoais para servidores
              externos.
            </Paragraph>
            <Paragraph>
              Os documentos digitalizados e salvos são armazenados exclusivamente no armazenamento local
              do seu dispositivo e nunca são enviados para a internet sem sua autorização explícita.
            </Paragraph>
          </Section>

          <Section title="2. Permissões Utilizadas">
            <BulletItem label="Câmera:" text="Utilizada para digitalizar documentos. Nenhuma imagem é enviada para servidores externos." />
            <BulletItem label="Armazenamento:" text="Necessário para salvar os documentos digitalizados localmente no dispositivo." />
          </Section>

          <Section title="3. Compartilhamento de Dados">
            <Paragraph>
              Não compartilhamos suas informações pessoais ou documentos com terceiros. O aplicativo
              não possui anúncios, rastreadores ou qualquer SDK de análise que colete dados do usuário.
            </Paragraph>
          </Section>

          <Section title="4. Armazenamento e Segurança">
            <Paragraph>
              Todos os documentos digitalizados são armazenados localmente no seu dispositivo. Somos
              comprometidos com a segurança dos seus dados. No entanto, recomendamos que você mantenha
              seu dispositivo protegido com senha ou biometria.
            </Paragraph>
          </Section>

          <Section title="5. Direitos do Usuário">
            <Paragraph>
              Você tem total controle sobre seus dados. Pode excluir qualquer documento a qualquer
              momento diretamente pelo aplicativo. Ao desinstalar o aplicativo, todos os dados
              armazenados localmente são removidos.
            </Paragraph>
          </Section>

          <Section title="6. Alterações nesta Política">
            <Paragraph>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre
              quaisquer mudanças publicando a nova política no aplicativo. Recomendamos que você
              revise esta política regularmente.
            </Paragraph>
          </Section>

          <Section title="7. Contato">
            <Paragraph>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos
              seus dados, entre em contato conosco:
            </Paragraph>
            <View style={styles.contactBox}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactEmail}>pythontrainer96@gmail.com</Text>
            </View>
          </Section>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ text, children }: { text?: string; children?: string }) {
  return <Text style={paragraphStyles.text}>{text ?? children}</Text>;
}

function BulletItem({ label, text }: { label: string; text: string }) {
  return (
    <View style={bulletStyles.row}>
      <Text style={bulletStyles.dot}>•</Text>
      <Text style={bulletStyles.text}>
        <Text style={bulletStyles.label}>{label} </Text>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 26, color: Colors.text, lineHeight: 32 },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text,
  },

  content: { padding: Spacing.xxl, paddingBottom: 48 },

  lastUpdated: {
    fontSize: FontSize.sm, color: Colors.text3,
    marginBottom: Spacing.lg, fontStyle: 'italic',
  },
  intro: {
    fontSize: FontSize.md, color: Colors.text2,
    lineHeight: 24, marginBottom: Spacing.xxl,
  },

  contactBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md, padding: Spacing.md,
  },
  contactIcon: { fontSize: 20 },
  contactEmail: {
    fontSize: FontSize.md, color: Colors.accent2, fontWeight: FontWeight.medium,
  },
});

const sectionStyles = StyleSheet.create({
  container: { marginBottom: Spacing.xxl },
  title: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: Colors.text, marginBottom: Spacing.sm,
  },
});

const paragraphStyles = StyleSheet.create({
  text: {
    fontSize: FontSize.md, color: Colors.text2,
    lineHeight: 24, marginBottom: Spacing.sm,
  },
});

const bulletStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 8,
    marginBottom: Spacing.sm,
  },
  dot: { fontSize: FontSize.md, color: Colors.accent2, lineHeight: 24 },
  text: { flex: 1, fontSize: FontSize.md, color: Colors.text2, lineHeight: 24 },
  label: { fontWeight: FontWeight.semibold, color: Colors.text },
});
