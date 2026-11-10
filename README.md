# Pomodoro Focus ⏱️

Aplicativo desenvolvido para a atividade de Programação para Dispositivos Móveis II, utilizando React, Capacitor e o plugin `@capacitor/local-notifications`.

## Objetivo

Demonstrar notificações locais no Android: solicitação de permissão, disparo imediato, agendamento futuro, consulta/cancelamento de notificações pendentes e aviso sonoro ao fim de um ciclo Pomodoro.

## Requisitos implementados

- [x] Verificar permissão com `checkPermissions()`.
- [x] Solicitar permissão com `requestPermissions()` (Android 13+).
- [x] Enviar notificação imediata.
- [x] Agendar notificação futura.
- [x] Ciclo de foco demonstrativo de 25 segundos.
- [x] Alerta com título **Focus Pomodoro** e mensagem **Fim do ciclo de foco! Faça uma pausa de 5 minutos.**
- [x] Consultar notificações pendentes com `getPending()`.
- [x] Cancelar notificações com `cancel()`.
- [x] Desafio extra: canal Android com som personalizado `focus_end.wav`.
- [x] Workflow GitHub Actions para gerar APK a cada push em `main` ou `master`.

## Tecnologias

- React + Vite
- Capacitor 7
- `@capacitor/local-notifications`
- Lucide React
- Android Studio / Gradle
- GitHub Actions

## 1. Pré-requisitos

Instale Node.js 22, Git e Android Studio. Para compilar localmente, configure o Android SDK pelo Android Studio.

## 2. Instalar dependências

Na pasta do projeto, execute:

```bash
npm install
npm install @capacitor/local-notifications@latest-7
npm install lucide-react
```

## 3. Criar a plataforma Android

```bash
npx cap add android
```

O projeto já inclui `capacitor.config.ts`, com o identificador `com.senai.pomodorofocus`.

## 4. Adicionar o som do desafio extra

Depois de criar a pasta Android, copie o arquivo `assets/focus_end.wav` para:

`android/app/src/main/res/raw/focus_end.wav`

Se a pasta `raw` não existir, crie-a. O nome precisa ser exatamente `focus_end.wav`.

No arquivo `android/app/src/main/AndroidManifest.xml`, dentro da tag `<manifest>` e antes de `<application>`, adicione também:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Essa permissão é relevante para alarmes agendados com precisão a partir do Android 12. O Android pode exigir que o usuário autorize alarmes e lembretes nas configurações do sistema.

O aplicativo cria o canal Android `pomodoro-focus` com esse arquivo como som. O Android mantém as configurações de um canal depois da primeira criação; se alterar o som durante os testes, desinstale o app do celular e instale novamente para recriar o canal.

## 5. Sincronizar e executar

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização do Gradle, conecte o celular com depuração USB ativada e pressione **Run**.

Para abrir a versão web de visualização:

```bash
npm run dev
```

> As notificações nativas e a permissão do sistema precisam ser testadas no aplicativo Android instalado. O navegador serve apenas para conferir a interface.

## 6. Testar a atividade

1. Abra o aplicativo no Android.
2. Toque em **Verificar / permitir notificações** e aceite a permissão.
3. Toque em **Enviar notificação agora** para testar o disparo imediato.
4. Toque em **5s**, **10s** ou **15s** para testar um agendamento curto.
5. Inicie o foco. O ciclo demonstrativo termina em 25 segundos.
6. Minimize ou feche o aplicativo durante o teste: o sistema Android deve entregar a notificação agendada.
7. Confira o aviso sonoro do canal **Fim do foco**.
8. Consulte os alertas pendentes e teste **Cancelar todos**.

## 7. Gerar APK localmente

Depois de sincronizar o Android:

```bash
cd android
./gradlew assembleDebug
```

No Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

O APK será gerado em:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 8. Gerar APK pelo GitHub Actions

1. Crie um repositório no GitHub.
2. Envie todo o projeto, incluindo a pasta `android/` gerada por `npx cap add android`.
3. Faça push para `main` ou `master`.
4. Abra a aba **Actions** do GitHub.
5. Entre no workflow **Build Android APK**.
6. Quando terminar com sucesso, baixe o artefato `pomodoro-focus-app-debug`.

## 9. O que colocar na entrega

- Código-fonte do projeto.
- APK debug gerado.
- Prints das telas principais.
- GIF ou vídeo curto demonstrando a interface.
- Gravação de tela do celular: permissão, notificação imediata e notificação após 25 segundos.
- Este README com a apresentação e instruções.

## Observações técnicas

- Android 13 (API 33) ou superior exige permissão de notificação em tempo de execução.
- O som é configurado no canal nativo do Android. O usuário também pode silenciar o canal nas configurações do aparelho.
- O cronômetro visual usa o relógio do sistema para calcular o tempo restante. A notificação é agendada nativamente, portanto não depende de manter a tela React aberta.
- O tempo de 25 segundos é uma duração reduzida para demonstração da atividade. Em um Pomodoro convencional, o ciclo de foco costuma ser maior.
- A entrega por GitHub Actions depende de o projeto Android ter sido criado e versionado no repositório.

## Referências

- [Capacitor Local Notifications — documentação oficial](https://next.capacitorjs.com/docs/apis/local-notifications)
- [Capacitor Android — documentação oficial](https://capacitorjs.com/docs/android)
