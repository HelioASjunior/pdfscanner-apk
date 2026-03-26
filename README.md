# ScanPDF - App de Scanner de Documentos

App completo em React Native (Expo) para Android que digitaliza documentos e gera PDFs.

## Funcionalidades

- 📷 **Scanner com câmera real** — detecção de borda, linha animada de scan
- 🎨 **Filtros de imagem** — Auto, Preto & Branco, Aprimorado, Original
- 🔄 **Rotação e ajuste** de páginas capturadas
- 📄 **Exportar para PDF real** via expo-print
- 📤 **Compartilhar** via WhatsApp, E-mail, Drive, etc.
- 🔤 **OCR** (extração de texto) via API
- 📁 **Gerenciar documentos** — listar, buscar, ordenar, excluir
- ☁️ **Backup Google Drive**
- ⚙️ **Configurações** completas

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta gratuita em https://expo.dev
- EAS CLI instalado globalmente

---

## Instalação e configuração

### 1. Instalar dependências

```bash
cd ScanPDF
npm install
```

### 2. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 3. Login na conta Expo

```bash
eas login
# ou
npx expo login
```

### 4. Criar projeto no Expo

```bash
npx expo register   # se não tiver conta
# ou acesse https://expo.dev e crie um projeto
```

### 5. Vincular o projeto

Após criar o projeto em https://expo.dev, copie o Project ID e edite `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "SEU_PROJECT_ID_AQUI"   ← substitua aqui
  }
}
```

Depois rode:

```bash
eas init --id SEU_PROJECT_ID
```

---

## Gerar o APK

### APK de teste (mais rápido, gratuito)

```bash
eas build --platform android --profile preview
```

Isso gera um arquivo `.apk` que pode ser instalado diretamente no celular.

### APK de produção (Google Play)

```bash
eas build --platform android --profile production
```

Isso gera um `.aab` para publicar na Play Store.

---

## Testar localmente (sem build na nuvem)

### Opção A — Expo Go

```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go** (disponível na Play Store).

### Opção B — Build local (precisa do Android Studio)

```bash
npx expo run:android
```

Requer Android SDK configurado com `ANDROID_HOME` apontando para o SDK.

---

## Estrutura do projeto

```
ScanPDF/
├── App.tsx                    # Ponto de entrada
├── app.json                   # Config do Expo (nome, permissões, ícone)
├── eas.json                   # Config de build (APK / AAB)
├── package.json
├── babel.config.js
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Dashboard principal
│   │   ├── CameraScreen.tsx   # Scanner com câmera real
│   │   ├── EditorScreen.tsx   # Editar, filtrar, exportar PDF
│   │   ├── DocumentsScreen.tsx # Listar todos os documentos
│   │   └── SettingsScreen.tsx  # Configurações
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Tabs + Stack navigator
│   └── utils/
│       ├── store.ts           # Estado global (Zustand)
│       ├── theme.ts           # Cores, espaçamento, fontes
│       └── helpers.ts         # Funções utilitárias
└── assets/                    # Ícone e splash screen
```

---

## Adicionar ícone e splash screen

Substitua os arquivos em `assets/`:

- `icon.png` — 1024x1024px (ícone do app)
- `adaptive-icon.png` — 1024x1024px (Android adaptive icon)
- `splash.png` — 1284x2778px (tela de carregamento)

Ou use o gerador automático:

```bash
npx expo-splash-screen assets/icon.png --background-color "#0f0f13"
```

---

## Publicar na Google Play Store

1. Gere o build de produção (`.aab`):
   ```bash
   eas build --platform android --profile production
   ```

2. Faça login na [Google Play Console](https://play.google.com/console)

3. Crie um novo aplicativo

4. Faça upload do arquivo `.aab` gerado

5. Preencha as informações e publique

---

## Dependências principais

| Pacote | Finalidade |
|--------|-----------|
| `expo-camera` | Câmera para capturar fotos |
| `expo-image-manipulator` | Aplicar filtros e rotação |
| `expo-print` | Gerar arquivo PDF real |
| `expo-sharing` | Compartilhar via sistema Android |
| `expo-file-system` | Salvar arquivos no dispositivo |
| `expo-haptics` | Feedback tátil |
| `zustand` | Estado global simples |
| `@react-navigation` | Navegação entre telas |

---

## Troubleshooting

**Erro de permissão de câmera:**
Certifique-se que as permissões estão declaradas em `app.json` e que o usuário as concedeu.

**Build falha no EAS:**
Verifique se o `projectId` em `app.json` está correto e se você está logado com `eas whoami`.

**Módulo não encontrado:**
```bash
npm install
npx expo install
```

---

## Suporte

Projeto gerado com **ScanPDF v1.0.0** usando Expo SDK 51.
