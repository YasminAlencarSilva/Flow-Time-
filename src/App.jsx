import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import {
  Bell, BellRing, Check, ChevronRight, CircleHelp, Clock3, Coffee,
  Focus, History, Pause, Play, RotateCcw, ShieldCheck, Sparkles,
  Volume2, X
} from 'lucide-react';

const FOCUS_SECONDS = 25; // Atividade: 25 segundos (demonstração)
const BREAK_SECONDS = 5 * 60;
const CHANNEL_ID = 'pomodoro-focus';
const NOTIFICATION_TITLE = 'Focus Pomodoro';
const NOTIFICATION_BODY = 'Fim do ciclo de foco! Faça uma pausa de 5 minutos.';

const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const isNative = Capacitor.isNativePlatform();

export default function App() {
  const [permission, setPermission] = useState('checking');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const [status, setStatus] = useState('Tudo pronto para sua próxima sessão.');
  const [pending, setPending] = useState([]);
  const [sessions, setSessions] = useState(0);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);
  const notificationIdRef = useRef(null);
  const endTimeRef = useRef(null);

  const refreshPending = useCallback(async () => {
    try {
      const result = await LocalNotifications.getPending();
      setPending(result.notifications || []);
    } catch (error) {
      console.error('Não foi possível consultar notificações pendentes:', error);
    }
  }, []);

  const setupChannel = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Fim do foco',
        description: 'Aviso sonoro quando o ciclo Pomodoro termina',
        importance: 5,
        sound: 'focus_end.wav',
        vibration: true,
        visibility: 1
      });
    } catch (error) {
      // O canal pode já existir. No Android, as configurações do canal
      // são controladas pelo sistema depois da primeira criação.
      console.info('Canal de notificação:', error);
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setPermission(result.display);
      if (result.display === 'granted') {
        setStatus('Permissão de notificações ativada.');
      } else {
        setStatus('Permita as notificações para receber o aviso ao fim do foco.');
      }
      return result.display === 'granted';
    } catch (error) {
      console.error(error);
      setPermission('error');
      setStatus('Não foi possível verificar a permissão neste ambiente.');
      return false;
    }
  }, []);

  useEffect(() => {
    setupChannel();
    checkPermission();
    refreshPending();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setupChannel, checkPermission, refreshPending]);

  const requestPermission = async () => {
    setBusy(true);
    try {
      const current = await LocalNotifications.checkPermissions();
      const result = current.display === 'granted'
        ? current
        : await LocalNotifications.requestPermissions();
      setPermission(result.display);
      setStatus(result.display === 'granted'
        ? 'Permissão concedida! Você já pode iniciar seu foco.'
        : 'Permissão não concedida. Verifique as configurações do Android.');
      if (result.display === 'granted') await setupChannel();
    } catch (error) {
      console.error(error);
      setStatus('Erro ao solicitar permissão. Tente novamente nas configurações.');
    } finally {
      setBusy(false);
    }
  };

  const ensurePermission = async () => {
    const granted = await checkPermission();
    if (granted) return true;
    await requestPermission();
    const afterRequest = await LocalNotifications.checkPermissions();
    setPermission(afterRequest.display);
    return afterRequest.display === 'granted';
  };

  const sendImmediate = async () => {
    setBusy(true);
    try {
      if (!(await ensurePermission())) {
        setStatus('Ação cancelada: conceda a permissão de notificações.');
        return;
      }
      const id = Math.floor(Date.now() % 2000000000);
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: 'Pomodoro Focus',
          body: 'Sua concentração está no caminho certo. Continue assim!',
          channelId: CHANNEL_ID,
          extra: { type: 'manual-test' }
        }]
      });
      setStatus('Notificação imediata enviada ao sistema!');
      await refreshPending();
    } catch (error) {
      console.error(error);
      setStatus('Não foi possível enviar a notificação imediata.');
    } finally {
      setBusy(false);
    }
  };


  const cancelFocusNotification = async () => {
    if (notificationIdRef.current == null) return;
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationIdRef.current }]
      });
      notificationIdRef.current = null;
      await refreshPending();
    } catch (error) {
      console.error('Erro ao cancelar alerta do foco:', error);
    }
  };

  const startFocus = async () => {
    if (running || busy) return;
    setBusy(true);
    try {
      if (!(await ensurePermission())) {
        setStatus('Ative a permissão antes de iniciar o Pomodoro.');
        return;
      }
      if (mode === 'break' || secondsLeft <= 0) {
        setMode('focus');
        setSecondsLeft(FOCUS_SECONDS);
      }
      const duration = mode === 'break' || secondsLeft <= 0 ? FOCUS_SECONDS : secondsLeft;
      const id = Math.floor(Date.now() % 2000000000);
      notificationIdRef.current = id;
      const at = new Date(Date.now() + duration * 1000);
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: NOTIFICATION_TITLE,
          body: NOTIFICATION_BODY,
          schedule: { at, allowWhileIdle: true },
          channelId: CHANNEL_ID,
          extra: { type: 'pomodoro-finish' }
        }]
      });
      await refreshPending();
      endTimeRef.current = Date.now() + duration * 1000;
      setRunning(true);
      setStatus('Sessão iniciada! Concentre-se até o aviso tocar.');
    } catch (error) {
      console.error(error);
      setStatus('Falha ao programar o término do ciclo.');
    } finally {
      setBusy(false);
    }
  };

  const pauseFocus = async () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    await cancelFocusNotification();
    setStatus('Sessão pausada. Retome quando estiver pronto.');
  };

  const resetFocus = async () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    await cancelFocusNotification();
    setMode('focus');
    setSecondsLeft(FOCUS_SECONDS);
    setStatus('Cronômetro reiniciado. Pronto para outra sessão.');
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setRunning(false);
        setMode('break');
        setSessions((value) => value + 1);
        setSecondsLeft(BREAK_SECONDS);
        setStatus('Ciclo concluído! Seu aviso foi programado. Faça uma pausa de 5 minutos.');
        refreshPending();
      }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [running, refreshPending]);

  const scheduleCustom = async (seconds) => {
    setBusy(true);
    try {
      if (!(await ensurePermission())) {
        setStatus('Conceda a permissão antes de agendar um alerta.');
        return;
      }
      const id = Math.floor(Date.now() % 2000000000);
      const at = new Date(Date.now() + seconds * 1000);
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: NOTIFICATION_TITLE,
          body: NOTIFICATION_BODY,
          schedule: { at, allowWhileIdle: true },
          channelId: CHANNEL_ID,
          extra: { type: 'pomodoro-test' }
        }]
      });
      setStatus(`Alerta de conclusão agendado para daqui a ${seconds} segundos.`);
      await refreshPending();
    } catch (error) {
      console.error(error);
      setStatus('Erro ao agendar o alerta de teste.');
    } finally {
      setBusy(false);
    }
  };

  const cancelAll = async () => {
    setBusy(true);
    try {
      const result = await LocalNotifications.getPending();
      if (!result.notifications.length) {
        setStatus('Não há notificações pendentes para cancelar.');
        return;
      }
      await LocalNotifications.cancel({ notifications: result.notifications });
      notificationIdRef.current = null;
      setPending([]);
      setStatus('Todas as notificações pendentes foram canceladas.');
    } catch (error) {
      console.error(error);
      setStatus('Não foi possível cancelar as notificações.');
    } finally {
      setBusy(false);
    }
  };

  const progress = mode === 'break'
    ? ((BREAK_SECONDS - secondsLeft) / BREAK_SECONDS) * 100
    : ((FOCUS_SECONDS - secondsLeft) / FOCUS_SECONDS) * 100;

  const permissionLabel = permission === 'granted' ? 'Ativada'
    : permission === 'checking' ? 'Verificando'
    : permission === 'error' ? 'Indisponível' : 'Necessária';

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Pomodoro Focus início">
          <span className="brand-mark"><Focus size={21} /></span>
          <span>pomodoro<span className="brand-light">focus</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-dot" />
          <span>SEU ESPAÇO DE FOCO</span>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="eyebrow"><Sparkles size={14} /> MENOS DISTRAÇÃO, MAIS PRESENÇA</div>
        <h1>Entre no seu<br /><span>modo foco.</span></h1>
        <p className="hero-copy">Um ciclo de cada vez. Respire, concentre-se e deixe o resto para depois.</p>
      </section>

      <section className="dashboard">
        <article className="timer-card">
          <div className="card-topline">
            <div>
              <span className="section-kicker">SUA SESSÃO</span>
              <h2>{mode === 'break' ? 'Hora de respirar' : 'Tempo de concentração'}</h2>
            </div>
            <span className={`mode-pill ${mode === 'break' ? 'break-pill' : ''}`}>
              {mode === 'break' ? <Coffee size={14} /> : <Focus size={14} />}
              {mode === 'break' ? 'PAUSA' : 'POMODORO'}
            </span>
          </div>

          <div className="timer-wrap">
            <svg className="timer-ring" viewBox="0 0 260 260" role="img" aria-label={`Tempo restante: ${formatTime(secondsLeft)}`}>
              <circle className="ring-track" cx="130" cy="130" r="112" />
              <circle
                className="ring-progress"
                cx="130" cy="130" r="112"
                strokeDasharray={`${2 * Math.PI * 112}`}
                strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
              />
            </svg>
            <div className="timer-center">
              <span className="timer-label">{running ? 'MANTENHA O RITMO' : mode === 'break' ? 'PAUSA SUGERIDA' : 'PRONTO PARA COMEÇAR?'}</span>
              <strong>{formatTime(secondsLeft)}</strong>
              <span className="timer-sub">{mode === 'break' ? '5 minutos de descanso' : '25 segundos de demonstração'}</span>
            </div>
          </div>

          <div className="timer-actions">
            {!running ? (
              <button className="button-primary" onClick={startFocus} disabled={busy}>
                <Play size={17} fill="currentColor" /> {busy ? 'AGUARDE...' : 'Iniciar foco'}
              </button>
            ) : (
              <button className="button-primary" onClick={pauseFocus}>
                <Pause size={17} fill="currentColor" /> Pausar sessão
              </button>
            )}
            <button className="button-icon" onClick={resetFocus} aria-label="Reiniciar cronômetro">
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="timer-foot"><span /> {running ? 'Sua sessão está em andamento' : 'Seu próximo passo começa aqui'}</div>
        </article>

        <aside className="side-column">
          <article className="permission-card">
            <div className="mini-card-heading">
              <span className="icon-tile"><BellRing size={18} /></span>
              <span className="section-kicker">NOTIFICAÇÕES</span>
            </div>
            <div className="permission-row">
              <div>
                <h3>Permissão do sistema</h3>
                <p>Necessária para avisar quando seu foco terminar.</p>
              </div>
              <span className={`permission-status ${permission === 'granted' ? 'ok' : ''}`}>
                <span /> {permissionLabel}
              </span>
            </div>
            <button className="button-secondary" onClick={requestPermission} disabled={busy}>
              <ShieldCheck size={16} /> Verificar / permitir notificações <ChevronRight size={16} />
            </button>
            {!isNative && <p className="web-note">Visualização web: permissões e alertas nativos funcionam no APK Android.</p>}
          </article>

          <article className="quick-card">
            <div className="mini-card-heading">
              <span className="icon-tile blue"><Clock3 size={18} /></span>
              <span className="section-kicker">TESTE DE ALERTAS</span>
            </div>
            <h3>Experimente o lembrete</h3>
            <p>Programe o aviso de conclusão para alguns segundos.</p>
            <div className="quick-buttons">
              {[5, 10, 15].map((value) => (
                <button key={value} onClick={() => scheduleCustom(value)} disabled={busy}>
                  {value}s
                </button>
              ))}
            </div>
            <button className="text-action" onClick={sendImmediate} disabled={busy}>
              <Bell size={15} /> Enviar notificação agora
            </button>
          </article>

          <article className="sound-card">
            <span className="sound-icon"><Volume2 size={19} /></span>
            <div>
              <strong>Aviso sonoro ativado</strong>
              <p>O Android usa o som configurado no canal “Fim do foco”.</p>
            </div>
            <Check size={17} className="sound-check" />
          </article>
        </aside>
      </section>

      <section className="bottom-grid">
        <article className="status-card">
          <div className="bottom-heading"><span className="icon-tile small"><History size={17} /></span><h3>Central de atividade</h3></div>
          <p className="status-message">{status}</p>
          <div className="status-meta"><span className="status-indicator" /> STATUS DO APLICATIVO</div>
        </article>
        <article className="stats-card">
          <div className="bottom-heading"><span className="icon-tile small blue"><Sparkles size={17} /></span><h3>Seu progresso</h3></div>
          <div className="stat-number">{sessions.toString().padStart(2, '0')}</div>
          <p>ciclos de foco concluídos nesta sessão</p>
        </article>
        <article className="pending-card">
          <div className="bottom-heading"><span className="icon-tile small"><Bell size={17} /></span><h3>Alertas programados</h3></div>
          <div className="pending-number">{pending.length}<span> pendentes</span></div>
          <button className="cancel-link" onClick={cancelAll} disabled={busy || pending.length === 0}>
            <X size={14} /> Cancelar todos
          </button>
        </article>
      </section>

      <footer className="footer">
        <span>feito para você encontrar seu ritmo.</span>
        <span> POMODORO FOCUS <span className="footer-dot">•</span> AULA 15</span>
      </footer>
    </main>
  );
}