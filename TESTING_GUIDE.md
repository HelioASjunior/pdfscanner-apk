# 🧪 Guia de Testes e Troubleshooting - Camera Module v2.0

## ✅ Checklist Pré-Lançamento

- [ ] Todos os imports resolvidos (sem erros de compilação)
- [ ] CameraScreen renderiza sem crashes
- [ ] EdgeDetectionOverlay mostra quadrilátero
- [ ] Cor muda: branco (instável) → verde (estável)
- [ ] Botão Shutter captura foto corretamente
- [ ] CropAdjustmentScreen abre com a imagem
- [ ] Magnifier aparece ao arrastar corners
- [ ] Botão Aplicar processa e volta para Camera
- [ ] Página é salva no store com sucesso

---

## 🧪 Testes Manuais Recomendados

### **Teste 1: Edge Detection Visual**
```
1. Abra o app e vá para Camera (aba Escanear)
2. Aponte para um documento A4 em boa iluminação
3. Observe o quadrilátero branco aparecendo
4. Alinhe os cantos com o documento
5. Verifique: cor muda para VERDE
6. Texto muda para "✓ Pronto para capturar"
7. Setas (↖↗↙↘) desaparecem quando estável
```

**Esperado**: Transição suave 0,5s entre cores
**Problema**: Não muda de cor? → Edge detection pode não estar ativo

---

### **Teste 2: Captura e Crop**
```
1. Com documento bem enquadrado (verde)
2. Clique no botão BRANCO circular (Shutter)
3. Você deve ouvir vibração + ver flash visual
4. Tela deve levar a CropAdjustmentScreen
5. Veja a foto capturada com 4 pontos nos cantos
6. Clique e arraste um canto
7. Magnifier (lupa) deve aparecer no canto superior
8. Clique "Aplicar"
9. Deve processar + voltar para Camera
```

**Esperado**: Fluxo fluido entre telas
**Problema comum**: Magnifier não aparece → Ajuste y position no CropScreen

---

### **Teste 3: Múltiplas Páginas**
```
1. Na Camera, clique Shutter e capture página 1
2. Ajuste corners e clique Aplicar
3. Volta para Camera automaticamente
4. Badge de páginas deve mostrar "1 página"
5. Thumbnails devem aparecer no bottom
6. Capture página 2
7. Badge deve mostrar "2 páginas"
8. Clique "Pronto" (checkmark)
9. Deve ir para Editor com ambas as páginas
```

**Esperado**: Múltiplas páginas acumulam no store
**Problema**: Badge não atualiza? → useAppStore pode não estar sincronizado

---

### **Teste 4: Estabilidade da Câmera**
```
1. Teste em 3 ambientes diferentes:
   a) Luz natural (janela)
   b) Luz artificial (escritório)
   c) Pouca luz (à noite)
2. Para cada, veja tempo de detecção
3. Anote FPS/lag inicial
```

**Esperado**: Detecção rápida (< 500ms)
**Problema**: Lag? → Reduzir frequência de detecção de 500ms para 1000ms

---

## 🐛 Problemas Conhecidos e Soluções

### **Problema 1: "Cannot find module 'imageProcessing'"**
```
Erro: Cannot find module './imageProcessing' or its corresponding type declarations

Solução:
- Verifique caminho do import
- Correto: import { ... } from '../utils/imageProcessing'
- Incorreto: import { ... } from './imageProcessing'
```

---

### **Problema 2: CropAdjustmentScreen não abre**
```
Erro: Route 'CropAdjustment' not found

Solução:
- Verificar AppNavigator.tsx linha 120-123
- Adicionar: <Stack.Screen name="CropAdjustment" component={CropAdjustmentScreen} .../>
- Verificar import do componente no início do arquivo
```

---

### **Problema 3: Magnifier não aparece**
```
Erro: Magnifier renderiza mas em posição incorreta

Solução CropAdjustmentScreen, linha 160-180:
- Ajustar: left: Math.min(width - MAGNIFIER_SIZE - 8, magnifierPos.x + 20)
- Se muito à direita, reduce: + 20 para + 10
- Se muito embaixo, mude top: Math.max(100, magnifierPos.y - MAGNIFIER_SIZE - 20)
```

---

### **Problema 4: Flash não aparece**
```
Erro: Sem efeito visual de flash ao capturar

Solução CameraScreen, linha 85-95:
- Verifique useNativeDriver: true
- Aumente duration: 80ms para 150ms
- Adicione console.log('Flash triggered')
```

---

### **Problema 5: Cor do quadrilátero não muda**
```
Erro: Quadrilátero sempre branco, nunca fica verde

Solução:
a) Verifique EdgeDetectionOverlay.tsx, linha 45-47:
   const cornerColor = isStable ? Colors.accent : Colors.warning;

b) Verifique CameraScreen, linha 65:
   const stable = isDocumentStable(corners);
   console.log('Is stable:', stable);

c) Se console mostra sempre false:
   - Aumente tolerance em isDocumentStable()
   - Mude de 0.05 (5%) para 0.15 (15%)
```

---

### **Problema 6: PanResponder não detecta toque em corner**
```
Erro: Não consegue arrastar corners em CropAdjustmentScreen

Solução:
a) Aumente raio de detecção:
   Linha 55: if (isPointNear(point, corners[key], 50))
   Mude 50 para 80 (pixels)

b) Verifique pointerEvents:
   <View {...panResponder.panHandlers}>
   Remova pointerEvents="none" se houver

c) Log para debug:
   onStartShouldSetPanResponder: (evt) => {
     console.log('Touch detected:', evt.nativeEvent);
   }
```

---

### **Problema 7: Processamento muito lento**
```
Erro: Aplicar leva > 3 segundos em CropAdjustmentScreen

Solução imageProcessing.ts:
a) Reduzir resolução:
   imageUri, [{resize: {width: 1240}}]  // OK
   imageUri, [{resize: {width: 800}}]   // Mais rápido

b) Reduzir compress:
   compress: 0.85  // OK
   compress: 0.7   // Mais rápido

c) Skip Magic Color se não necessário:
   // const enhanced = await applyMagicColorFilter(...);
   return transformedUri; // Skip filter
```

---

### **Problema 8: Página não salva no store**
```
Erro: CropAdjusta ment.tsx aplica mas página não aparece

Solução CropAdjustmentScreen, linha 135-150:
a) Verifique addScanPage:
   const { addScanPage } = useAppStore();
   console.log('Adding page:', page);
   addScanPage(page);

b) Se addScanPage não está importado:
   import { useAppStore } from '../utils/store';

c) Verifique store.ts tem addScanPage definido
```

---

### **Problema 9: Volta para Camera não funciona**
```
Erro: Depois de "Aplicar", fica preso em CropAdjustment

Solução CropAdjustmentScreen, linha 152:
a) Verifique navegação:
   navigation.navigate('Camera');

b) Se não funciona:
   navigation.pop();  // Volta para tela anterior

c) Debug:
   console.log('Navigating to Camera');
   navigation.navigate('Camera');
```

---

### **Problema 10: Badge de páginas não atualiza**
```
Erro: "0 páginas" mesmo depois de capturar

Solução CameraScreen, linha 35:
a) useAppStore pode estar desatualizado:
   const { scanPages, addScanPage, clearScanPages } = useAppStore();

b) Adicione debug após addScanPage:
   addScanPage(page);
   console.log('Total pages:', scanPages.length);

c) Verifique CropAdjustmentScreen retorna corretamente:
   // Antes de navegar, confirme:
   console.log('Page saved, current total:',
     useAppStore.getState().scanPages.length);
```

---

## 📊 Métricas de Performance

| Métrica | Esperado | Crítico |
|---------|----------|---------|
| Detecção de bordas | 500ms | <1000ms |
| Captura de foto | 300ms | <1000ms |
| Carregamento Crop | 200ms | <500ms |
| Aplicar transformação | 800ms | <2000ms |
| Navegação entre telas | 150ms | <400ms |

---

## 🔧 Debugging Avançado

### **Ativar logs detalhados**

```typescript
// No início de CameraScreen.tsx:
const DEBUG = true;

const log = (msg: string, data?: any) => {
  if (DEBUG) {
    console.log(`[CameraScreen] ${msg}`, data || '');
  }
};

// Uso:
log('Detection loop started');
log('Corners updated:', detectedCorners);
log('Stability:', isStable);
```

### **Testar isDocumentStable isoladamente**

```typescript
// Criar um componente de teste:
const corners = {
  topLeft: { x: 50, y: 50 },
  topRight: { x: 250, y: 50 },
  bottomLeft: { x: 45, y: 270 },
  bottomRight: { x: 255, y: 270 },
};

const result = isDocumentStable(corners);
console.log('Stable?', result); // Deve ser true para retângulo perfeito
```

### **Simulador vs Dispositivo Real**

| Aspecto | Simulador | Dispositivo |
|---------|-----------|-------------|
| Câmera | Virtual (funciona) | Real (mais acurado) |
| Detecção | Rápida | Normal |
| Touches | Pouco sensível | Muito sensível |

---

## 📱 Testes em Dispositivos Reais

### **Android (Recomendado)**
```bash
# Terminal 1
npm start

# Terminal 2
npx expo run:android

# Testes:
- Toque em cantos (mais sensitivo que simulador)
- Teste com LUZ natural vs artificial
- Teste rotation (portrait/landscape)
```

### **iOS**
```bash
# (Se der erro, tente expo run:ios com Xcode)
npx expo run:ios

# Testes similares ao Android
```

---

## ✨ Casos de Teste Positivos

### **Golden Path 1: Captura Simples**
```
1. Câmera abre → Quadrilátero visível ✓
2. Enquadra documento → Fica verde ✓
3. Clica Shutter → Flash + vibração ✓
4. CropAdjustment abre com foto ✓
5. Clica Aplicar → Processa ✓
6. Volta para Câmera ✓
7. Badge mostra "1 página" ✓
```

### **Golden Path 2: Múltiplas Páginas**
```
1. Captura página 1 ✓
2. Clica Aplicar → Salva ✓
3. Câmera abre novamente ✓
4. Captura página 2 ✓
5. Clica Aplicar → Salva ✓
6. Badge mostra "2 páginas" ✓
7. Clica Pronto → Vai Editor ✓
```

### **Golden Path 3: Ajuste de Corners**
```
1. Câmera captura foto ✓
2. CropAdjustment: vê foto + 4 pontos ✓
3. Arrasta ponto topLeft ✓
4. Magnifier aparece ✓
5. Solta → Magnifier desaparece ✓
6. Arrasta 3 pontos restantes ✓
7. Clica Aplicar → Processa ✓
8. Volta com página ajustada ✓
```

---

## 🎯 Conclusão

Se todos os 10 problemas conhecidos forem evitados, o módulo funcionará perfeitamente. 

**Próxima etapa**: Integrar ML Kit Document Scanner para detecção automática mais precisa.

---

*Última atualização: 26 de março de 2026*
*Desenvolvido para ScanPDF v1.0.0*
