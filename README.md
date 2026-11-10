# Flowtime — Aplicativo de Foco e Produtividade

Aplicativo mobile desenvolvido como atividade acadêmica da disciplina **Programação para Dispositivos Móveis II**, utilizando React, Vite, Capacitor e o plugin `@capacitor/local-notifications`.

O Flowtime utiliza a técnica Pomodoro para demonstrar o gerenciamento de ciclos de foco e descanso, integrando funcionalidades nativas de notificações locais do Android.

## Objetivo

Implementar e demonstrar recursos de notificações locais em dispositivos Android, explorando a integração entre tecnologias web e funcionalidades nativas por meio do Capacitor.

## Funcionalidades Implementadas

- Verificação de permissões com `checkPermissions()`.
- Solicitação de permissões com `requestPermissions()` (Android 13+).
- Envio de notificações locais imediatas.
- Agendamento de notificações futuras.
- Temporizador de foco demonstrativo de 25 segundos.
- Notificação automática ao término do ciclo de foco.
- Alerta com orientação para pausa de 5 minutos.
- Consulta de notificações pendentes com `getPending()`.
- Cancelamento de notificações agendadas com `cancel()`.
- Canal de notificações Android com som personalizado `focus_end.wav`.
- Integração com GitHub Actions para geração automatizada de APK.

## Tecnologias Utilizadas

| Tecnologia | Aplicação |
|---|---|
| React | Desenvolvimento da interface |
| Vite | Ambiente de desenvolvimento e build |
| Capacitor 7 | Integração com recursos nativos |
| Local Notifications | Gerenciamento de notificações |
| Lucide React | Biblioteca de ícones |
| Android Studio | Configuração e compilação Android |
| Gradle | Automação de build |
| GitHub Actions | Integração e automação de build |

## 1. Pré-requisitos

Antes de iniciar, certifique-se de possuir:

- Node.js 22.
- Git.
- Android Studio.
- Android SDK configurado.
- Java/JDK compatível com a configuração do Gradle.

## 2. Instalação das Dependências

Na pasta raiz do projeto, execute:

```bash
npm install
npm install @capacitor/local-notifications@latest-7
npm install lucide-react
```

## 3. Configuração da Plataforma Android

Adicione a plataforma Android ao projeto:

```bash
npx cap add android
```

O projeto utiliza o identificador de aplicativo:

`com.senai.pomodorofocus`

## 4. Configuração do Som Personalizado

Para implementar o desafio extra de notificação sonora, copie o arquivo:

`assets/focus_end.wav`

Para o diretório:

`android/app/src/main/res/raw/focus_end.wav`

Caso a pasta `raw` não exista, crie-a manualmente.

No arquivo `android/app/src/main/AndroidManifest.xml`, adicione a seguinte permissão dentro da tag `<manifest>` e antes de `<application>`:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Essa permissão é relevante para o agendamento de alarmes exatos no Android 12 ou superior. A autorização pode precisar ser concedida pelo usuário nas configurações do sistema.

O aplicativo utiliza o canal Android `pomodoro-focus`, configurado com o som personalizado.

**Importante:** o Android mantém as configurações dos canais após sua criação. Caso o arquivo de áudio seja alterado durante os testes, desinstale e instale novamente o aplicativo para recriar o canal.

## 5. Sincronização e Execução

Gere a versão de produção e sincronize os recursos nativos:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio:

1. Aguarde a sincronização do Gradle.
2. Conecte um dispositivo Android com depuração USB ativada ou configure um emulador.
3. Selecione o dispositivo.
4. Clique em **Run** para executar o aplicativo.

Para visualizar a interface pelo navegador:

```bash
npm run dev
```

As funcionalidades de notificações nativas devem ser testadas no aplicativo instalado no Android. O navegador é destinado apenas à visualização da interface.

## 6. Roteiro de Testes

1. Abra o Flowtime no dispositivo Android.
2. Acesse a funcionalidade de verificação e solicitação de permissões.
3. Autorize o envio de notificações.
4. Utilize a opção de envio imediato para testar uma notificação.
5. Teste os agendamentos de 5, 10 e 15 segundos.
6. Inicie o temporizador de foco de 25 segundos.
7. Minimize ou feche o aplicativo durante a contagem.
8. Aguarde a notificação automática de conclusão do ciclo.
9. Verifique a reprodução do som personalizado.
10. Consulte as notificações pendentes e teste a funcionalidade de cancelamento.

## 7. Geração do APK Local

Após sincronizar a plataforma Android, execute na raiz do projeto:

**Windows PowerShell:**

```powershell
cd android
.\gradlew.bat assembleDebug
```

**Linux / macOS:**

```bash
cd android
./gradlew assembleDebug
```

Após a compilação, o APK estará disponível em:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 8. Automação com GitHub Actions

O projeto possui um workflow para automatizar a geração do APK por meio do GitHub Actions.

Para utilizá-lo:

1. Crie um repositório no GitHub.
2. Envie o código-fonte, incluindo a pasta `android/` gerada pelo Capacitor.
3. Realize o push para a branch `main` ou `master`.
4. Acesse a aba **Actions** do repositório.
5. Selecione o workflow **Build Android APK**.
6. Aguarde a conclusão da execução.
7. Baixe o artefato `pomodoro-focus-app-debug` quando o processo finalizar com sucesso.

## 9. Materiais para Entrega

- Código-fonte completo.
- APK de demonstração.
- Capturas de tela das principais funcionalidades.
- Vídeo ou gravação de tela demonstrando a execução no Android.
- Demonstração da solicitação de permissões.
- Testes de notificações imediatas e agendadas.
- Demonstração do alerta sonoro personalizado.

## Observações Técnicas

- Android 13 (API 33) ou superior exige autorização em tempo de execução para notificações.
- O som das notificações é configurado por meio de um canal nativo do Android.
- O usuário pode modificar ou desativar o som do canal nas configurações do dispositivo.
- O temporizador visual utiliza o relógio do sistema para calcular o tempo restante.
- As notificações são agendadas nativamente e não dependem da tela React permanecer aberta.
- O ciclo de 25 segundos é utilizado exclusivamente para fins demonstrativos. A técnica Pomodoro tradicional utiliza períodos de foco mais longos.
- A automação do GitHub Actions depende da configuração e do versionamento correto da plataforma Android no repositório.

## Referências

- [Capacitor Local Notifications — Documentação oficial](https://capacitorjs.com/docs/apis/local-notifications)
- [Capacitor Android — Documentação oficial](https://capacitorjs.com/docs/android)
- [React — Documentação oficial](https://react.dev/)
- [Vite — Documentação oficial](https://vite.dev/)
- [GitHub Actions — Documentação oficial](https://docs.github.com/en/actions)
