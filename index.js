require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { GoogleGenAI } = require('@google/genai');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const os = require('os');

// ------------------- TUS DATOS -------------------
const CLAVE_IA_PRINCIPAL = process.env.CLAVE_IA_PRINCIPAL;
const CLAVE_IA_RESPALDO = process.env.CLAVE_IA_RESPALDO;
const MODELO_PRINCIPAL = 'gemini-3.6-flash';
const MODELO_RESPALDO = 'gemini-3.6-flash';
const NOMBRE_BOT = 'Criss Bot';
const CREADOR = 'Alberto';
const TU_NUMERO = '51996399291';
const JID_DUEÑO = `${TU_NUMERO}@s.whatsapp.net`;
const PUERTO = process.env.PORT || 3000;
const LIMITE_DIARIO_ESTIMADO = 1400; // ajusta según tus 2 cuentas de Gemini combinadas

if (!CLAVE_IA_PRINCIPAL || !CLAVE_IA_RESPALDO) {
  console.log('❌ ALERTA: no se detectaron las API keys en las variables de entorno.');
}

const PALABRAS_CRISIS = [
  'quiero morir', 'no quiero vivir', 'suicidar', 'suicidio', 'matarme',
  'quitarme la vida', 'hacerme daño', 'autolesion', 'cortarme'
];
function esMensajeDeCrisis(texto) {
  const t = texto.toLowerCase();
  return PALABRAS_CRISIS.some(p => t.includes(p));
}

const PALABRAS_COMPRA = [
  'cuanto cuesta', 'cuánto cuesta', 'precio', 'precios', 'quiero comprar',
  'tienes stock', 'como pago', 'cómo pago', 'esta disponible', 'está disponible', 'vendes'
];
function esIntencionCompra(texto) {
  const t = texto.toLowerCase();
  return PALABRAS_COMPRA.some(p => t.includes(p));
}

process.on('unhandledRejection', (err) => console.log('⚠️ Promesa no manejada:', err?.message || err));
process.on('uncaughtException', (err) => console.log('⚠️ Excepción no capturada:', err?.message || err));
// --------------------------------------------------

const aiPrincipal = new GoogleGenAI({ apiKey: CLAVE_IA_PRINCIPAL });
const aiRespaldo = new GoogleGenAI({ apiKey: CLAVE_IA_RESPALDO });

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

const REGLAS_IA_BASE = `
Eres ${NOMBRE_BOT}, y hablas como si fueras ${CREADOR} mismo respondiéndole a sus panas. Tienes personalidad bien marcada: choro, burlón, con harta jerga peruana de la calle, te encanta cargosear y tirar barra a tus panas, pero todo con cariño — es la vacilada de patas del barrio, no maltrato real.

INFORMACIÓN SOBRE ${CREADOR}:
- Es creador y desarrollador de bots de WhatsApp y aplicaciones
- Su mejor y más destacado bot es Criss Bot (tú mismo)
- Mayormente se conecta y está activo por las noches
- Vende archivos para Free Fire, tanto para PC como para Android: hologramas, aimbot, regedit, archivos data y paneles

✅ LO QUE SÍ PUEDES HACER:
- Hablar bien criollo, con jerga limeña/peruana a full: causa, asu mare, ah ya pe, jato, paltearse, tirar cague, ¿qué rico no?, misio, chibolo, etc.
- Meter garabatos suaves y groserías comunes (mierda, huevón, carajo, joder, ctm cuando el ambiente lo permite) para darle sazón, sin pasarse a insulto pesado
- Ser burlón y cargosear con humor: cachar a la persona, tirarle vacilada, hacerle broma tipo "ya causa no seas llorón" — siempre con buena onda de fondo
- Usar emojis con soltura en cada respuesta para darle vida y expresividad (😂🔥💀😅🙌), no de forma forzada sino como remate natural de la frase
- Si alguien te cuenta que tuvo un mal día, mezclar la burla ligera con calidez real: primero cargosear un toque, después sí darle ánimo de verdad
- Ayudar con preguntas generales, tareas o ejercicios si te las piden, resumido y con tu toque choro
- Hacer choteo y pequeña charla bien peruana

❌ LO QUE NUNCA HARÁS:
- Sonar como robot o hablar formal/acartonado — cero "estimado usuario", cero tono de call center
- Mencionar el nombre de la persona en cada respuesta — solo una vez al inicio
- Insultar de VERDAD a alguien (nada de agredir su familia, su físico, ni groserías pesadas tipo insultos raciales o humillantes) — el choreo es sabor, nunca maltrato real
- Ser grosero con alguien que claramente no le gusta ese trato o que ya te pidió que pares
- Escribir respuestas largas de varios párrafos
- Meter el tema de Free Fire o de tus ventas si nadie te lo preguntó
- NUNCA discutir precios exactos ni cerrar ventas tú mismo — si preguntan precio, ya se maneja aparte, no des números

📏 REGLA DE LARGO — MUY IMPORTANTE:
Tu respuesta NUNCA debe pasar de 7-8 líneas de WhatsApp. Si el tema es complejo, da lo esencial y ofrece seguir explicando si la persona quiere más.

🚨 IMPORTANTE — SEÑALES DE CRISIS REAL:
Si alguien menciona querer hacerse daño, autolesionarse, suicidarse, o dice cosas como "ya no quiero vivir", corta todo el choreo de inmediato. NO improvises consejos de vida. Responde con calidez genuina, dile que te importa mucho, y anímalo a hablar con alguien de confianza o un profesional, y que ${CREADOR} se va a comunicar con él/ella pronto. Cero humor, cero groserías en ese caso.
`;

const MENSAJES_ESPERA = [
  '🤖 Oe, causa... ahorita mi cerebro anda de vacaciones. Dame unos segundos y vuelvo al ruedo. 😵\u200d💫',
  '😵 Mano, me agarraste justo cuando estaba reiniciando las neuronas. Escríbeme otra vez en un ratito.',
  '🛠️ Ya pe, causa... me estoy acomodando por dentro. En un toque seguimos hablando.',
  '🤖 Uy... parece que se me cruzaron los cables. No me abandones, en un ratito vuelvo con toda. 😅',
  '😮\u200d💨 Causa, mi inteligencia se fue a tomar su Inca Kola. Dale unos segundos y regresa.',
  '🚧 Oe, no me apures pues. Ando resolviendo un temita interno. En breve estoy de vuelta. 😎',
  '💀 Ala... justo me agarraste con mantenimiento. Espérame un toque y seguimos con la chacota.',
  '🤖 Tranquilo, mano. No te estoy ignorando, solo que mi sistema anda renegando un ratito. 😅',
  '⚡ Causa, se me fue la corriente del cerebro un segundo. Escríbeme otra vez y le metemos.',
  '🤖 Oe, causa... mi motor de IA se quedó pensando demasiado. Dale un respiro y vuelvo con respuestas que sí valen la pena. 😏'
];
function mensajeEsperaAleatorio() {
  return MENSAJES_ESPERA[Math.floor(Math.random() * MENSAJES_ESPERA.length)];
}

function esAmigoEspecial(nombre) {
  const n = (nombre || '').toLowerCase();
  return n.includes('ruth') || n.includes('alejandro');
}

// ------------------- CONTADOR DIARIO DE CUOTA -------------------
const contadorCuota = { fecha: new Date().toDateString(), usados: 0 };
function registrarUsoIA() {
  const hoy = new Date().toDateString();
  if (contadorCuota.fecha !== hoy) {
    contadorCuota.fecha = hoy;
    contadorCuota.usados = 0;
  }
  contadorCuota.usados++;
}
function cuotaCasiAgotada() {
  return contadorCuota.usados >= LIMITE_DIARIO_ESTIMADO * 0.9;
}

// ------------------- MINI PERFILES DE CONTACTOS -------------------
const notasContactos = new Map(); // jid -> [texto, texto...]
function agregarNota(jid, texto) {
  if (!notasContactos.has(jid)) notasContactos.set(jid, []);
  notasContactos.get(jid).push(texto);
}
function obtenerNotas(jid) {
  return notasContactos.get(jid) || [];
}

// ------------------- RECORDATORIOS -------------------
const recordatoriosPendientes = []; // { tiempoEjecucion, texto }
function programarRecordatorio(minutos, texto) {
  recordatoriosPendientes.push({ tiempoEjecucion: Date.now() + minutos * 60000, texto });
}

let sockActivo = null; // referencia al socket actual, para usar fuera de iniciarBot
let ultimaActividadDueño = Date.now();
async function generarRespuestaIA(prompt, notasExtra) {
  let reglasFinales = REGLAS_IA_BASE;
  if (notasExtra) reglasFinales += `\n\nCONTEXTO ADICIONAL SOBRE ESTA PERSONA/SITUACIÓN: ${notasExtra}`;
  if (cuotaCasiAgotada()) {
    reglasFinales += `\n\n⚠️ Estamos casi al límite de solicitudes del día — responde MUY corto (1-2 líneas máximo), sin sacrificar el tono pero economizando palabras.`;
  }

  const intentar = async (ai, modelo) => {
    const res = await ai.models.generateContent({
      model: modelo,
      contents: prompt,
      config: { systemInstruction: reglasFinales, safetySettings: SAFETY_SETTINGS }
    });
    return res.text;
  };

  try {
    const r = await intentar(aiPrincipal, MODELO_PRINCIPAL);
    registrarUsoIA();
    return r;
  } catch (err1) {
    console.log('⚠️ Falló IA principal:', err1.message);
    try {
      const r = await intentar(aiRespaldo, MODELO_RESPALDO);
      registrarUsoIA();
      return r;
    } catch (err2) {
      console.log('⚠️ Falló IA respaldo:', err2.message);
      await new Promise(r => setTimeout(r, 1500));
      const r = await intentar(aiPrincipal, MODELO_PRINCIPAL);
      registrarUsoIA();
      return r;
    }
  }
}

// Tiempo de "escribiendo..." proporcional al largo del mensaje
function calcularTiempoTecleo(texto) {
  const ms = texto.length * 35; // ritmo tipeo humano aprox
  return Math.min(Math.max(ms, 800), 4000);
}

// Divide una respuesta larga en 2 mensajes, cortando en el punto/salto más cercano a la mitad
function dividirEnDosPartes(texto) {
  if (texto.length < 220) return [texto];
  const mitad = Math.floor(texto.length / 2);
  const posibles = ['. ', '! ', '? ', '\n'];
  let corte = -1;
  for (const sep of posibles) {
    const idx = texto.indexOf(sep, mitad - 40);
    if (idx !== -1 && idx < mitad + 60) { corte = idx + sep.length; break; }
  }
  if (corte === -1) return [texto];
  return [texto.slice(0, corte).trim(), texto.slice(corte).trim()];
}

async function enviarRespuestaHumanizada(sock, jid, texto) {
  const partes = dividirEnDosPartes(texto);
  for (const parte of partes) {
    try {
      await sock.sendPresenceUpdate('composing', jid);
      await new Promise(r => setTimeout(r, calcularTiempoTecleo(parte)));
      await sock.sendMessage(jid, { text: parte });
      await sock.sendPresenceUpdate('paused', jid);
    } catch (err) {
      console.log('⚠️ Error en envío humanizado:', err.message);
    }
  }
}

const yaSaludados = new Set();
const yaMencionoNombre = new Set();
const pausaHasta = new Map();
const DURACION_PAUSA_MS = 5 * 60 * 1000;

const estado = {
  conectado: false,
  inicio: Date.now(),
  mensajesRecibidos: 0,
  mensajesEnviados: 0,
  ultimoQR: null,
  intentosReconexion: 0,
  ultimoError: null
};

function esChatPersonal(jid) {
  if (!jid) return false;
  if (jid.endsWith('@g.us')) return false;
  if (jid.endsWith('@broadcast')) return false;
  if (jid.includes('newsletter')) return false;
  return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid');
}

function calcularEsperaReconexion(intentos) {
  const base = Math.min(3000 * Math.pow(2, intentos), 60000);
  return intentos > 8 ? 90000 : base;
}

const almacenMensajes = new Map();

// ------------------- COMANDOS ADMIN (solo desde tu chat contigo mismo) -------------------
async function procesarComandoAdmin(sock, texto) {
  const partes = texto.trim().split(' ');
  const comando = partes[0].toLowerCase();

  if (comando === '!stats') {
    const uptimeH = ((Date.now() - estado.inicio) / 3600000).toFixed(1);
    await sock.sendMessage(JID_DUEÑO, {
      text: `📊 *Criss Bot*\nUptime: ${uptimeH}h\nMensajes recibidos: ${estado.mensajesRecibidos}\nMensajes enviados: ${estado.mensajesEnviados}\nUso IA hoy: ${contadorCuota.usados}/${LIMITE_DIARIO_ESTIMADO}\nReconexiones: ${estado.intentosReconexion}`
    });
    return true;
  }

  if (comando === '!ff') {
    await sock.sendMessage(JID_DUEÑO, {
      text: `🎮 Catálogo Free Fire (edítalo en el código, sección !ff):\n- Hologramas\n- Aimbot\n- Regedit\n- Archivos data\n- Paneles PC/Android`
    });
    return true;
  }

  if (comando === '!nota') {
    const numero = partes[1];
    const notaTexto = partes.slice(2).join(' ');
    if (!numero || !notaTexto) {
      await sock.sendMessage(JID_DUEÑO, { text: 'Uso: !nota 519XXXXXXXX texto de la nota' });
      return true;
    }
    const jidObjetivo = `${numero}@s.whatsapp.net`;
    agregarNota(jidObjetivo, notaTexto);
    await sock.sendMessage(JID_DUEÑO, { text: `✅ Nota agregada para ${numero}` });
    return true;
  }

  if (comando === '!recuerdame') {
    const minutos = parseInt(partes[1], 10);
    const notaTexto = partes.slice(2).join(' ');
    if (!minutos || !notaTexto) {
      await sock.sendMessage(JID_DUEÑO, { text: 'Uso: !recuerdame 120 enviar el archivo a fulano' });
      return true;
    }
    programarRecordatorio(minutos, notaTexto);
    await sock.sendMessage(JID_DUEÑO, { text: `⏰ Te recuerdo en ${minutos} min: "${notaTexto}"` });
    return true;
  }

  return false;
}
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    browser: [NOMBRE_BOT, 'Chrome', '2.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    getMessage: async (key) => almacenMensajes.get(key.id) || undefined
  });

  sockActivo = sock;
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      estado.ultimoQR = await QRCode.toDataURL(qr);
      console.log('\n📲 ESCANEA ESTE QR (o entra al panel web /qr):');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'open') {
      estado.conectado = true;
      estado.intentosReconexion = 0;
      estado.ultimoQR = null;
      console.log('\n✅ ✅ BOT CONECTADO Y LISTO ✅ ✅');
    }

    if (connection === 'close') {
      estado.conectado = false;
      const motivo = lastDisconnect?.error?.output?.statusCode;
      estado.ultimoError = lastDisconnect?.error?.message || 'Desconocido';
      console.log(`\n⚠️ Desconectado (código ${motivo || 'desconocido'}): ${estado.ultimoError}`);

      if (motivo === DisconnectReason.loggedOut) {
        console.log('❌ Sesión cerrada por WhatsApp. Borra la carpeta "sesion" y vuelve a escanear.');
        return;
      }
      if (motivo === DisconnectReason.badSession) {
        console.log('❌ Sesión corrupta. Borra la carpeta "sesion" y reinicia.');
        return;
      }
      if (motivo === DisconnectReason.restartRequired) {
        console.log('🔄 WhatsApp pidió reinicio de stream (515), reconectando de inmediato...');
        setTimeout(() => iniciarBot(), 1500);
        return;
      }

      estado.intentosReconexion++;
      const espera = calcularEsperaReconexion(estado.intentosReconexion);
      console.log(`🔄 Reintentando en ${espera / 1000}s (intento #${estado.intentosReconexion})...`);
      setTimeout(() => iniciarBot(), espera);
    }
  });

  sock.ev.on('messages.upsert', async m => {
    if (m.type !== 'notify') return;

    const msg = m.messages[0];
    if (!msg.message) return;

    const remitente = msg.key.remoteJid;

    // ---- Mensajes que TÚ mandas ----
    if (msg.key.fromMe) {
      ultimaActividadDueño = Date.now();

      const textoPropio = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      if (remitente === JID_DUEÑO && textoPropio.trim().startsWith('!')) {
        const fueComando = await procesarComandoAdmin(sock, textoPropio);
        if (fueComando) return;
      }

      pausaHasta.set(remitente, Date.now() + DURACION_PAUSA_MS);
      return;
    }

    almacenMensajes.set(msg.key.id, msg.message);
    if (!esChatPersonal(remitente)) return;

    const pausadoHasta = pausaHasta.get(remitente);
    if (pausadoHasta && Date.now() < pausadoHasta) return;

    // ---- Reacción a fotos/audios/videos sin texto ----
    const tipoMensaje = Object.keys(msg.message)[0];
    const esSoloMedia = ['imageMessage', 'audioMessage', 'videoMessage', 'stickerMessage'].includes(tipoMensaje)
      && !(msg.message.conversation || msg.message.extendedTextMessage?.text);
    if (esSoloMedia) {
      try {
        await sock.sendMessage(remitente, { react: { text: '👀', key: msg.key } });
        await sock.sendMessage(remitente, { text: 'Uy causa, a fotos/audios aún no les entro a full, mándame texto mejor 😅' });
      } catch (err) {
        console.log('⚠️ Error reaccionando a media:', err.message);
      }
      return;
    }

    estado.mensajesRecibidos++;
    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const nombreContacto = msg.pushName || 'amig@';

    // ---- Saludo inicial ----
    if (!yaSaludados.has(remitente)) {
      yaSaludados.add(remitente);
      yaMencionoNombre.add(remitente);
      const saludo = `👋 ¡Qué fue, causa! Soy Criss IA, el asistente inteligente de Alberto.\n\nEstoy aquí para ayudarte, conversar y meterle un poco de vida al chat. Si vienes con buena onda, todo chévere... pero si vienes a hacer hora, también sé responder. 😏🔥\n\n> Att Alberto`;
      try {
        await enviarRespuestaHumanizada(sock, remitente, saludo);
        estado.mensajesEnviados++;
      } catch (err) {
        console.log('❌ Error enviando saludo:', err.message);
      }
      return;
    }

    // ---- Intención de compra: no improvisa precios, avisa al dueño ----
    if (esIntencionCompra(texto)) {
      try {
        await sock.sendMessage(remitente, { text: 'Dame un toque que le aviso a Alberto para que te atienda directo 🙌' });
        await sock.sendMessage(JID_DUEÑO, {
          text: `💰 Posible cliente: ${nombreContacto} (${remitente.split('@')[0]}) preguntó: "${texto}"`
        });
        estado.mensajesEnviados++;
      } catch (err) {
        console.log('❌ Error en flujo de compra:', err.message);
      }
      return;
    }

    try {
      if (esMensajeDeCrisis(texto)) {
        try {
          await sock.sendMessage(JID_DUEÑO, {
            text: `🚨 Alerta: ${nombreContacto} (${remitente}) escribió algo que parece señal de crisis. Mensaje: "${texto}". Por favor contáctalo directamente.`
          });
        } catch (errAlerta) {
          console.log('❌ No se pudo enviar la alerta:', errAlerta.message);
        }
      }

      const primeraVezIA = !yaMencionoNombre.has(remitente);
      if (primeraVezIA) yaMencionoNombre.add(remitente);

      let notas = '';
      if (esAmigoEspecial(nombreContacto)) {
        notas += `Esta persona (${nombreContacto}) es pana cercano de confianza de ${CREADOR} — trátalo con cariño extra, más choteo, sin insultos pesados igual. `;
      }
      const notasGuardadas = obtenerNotas(remitente);
      if (notasGuardadas.length) {
        notas += `Datos guardados sobre esta persona: ${notasGuardadas.join('; ')}. `;
      }
      const horasSinDueño = (Date.now() - ultimaActividadDueño) / 3600000;
      if (horasSinDueño > 6) {
        notas += `Alberto lleva varias horas sin conectarse — si viene al caso puedes mencionar casualmente que anda ausente/durmiendo, sin exagerar. `;
      }

      const encabezado = primeraVezIA
        ? `Consulta de ${nombreContacto} (primera vez que le respondes, puedes saludarlo por su nombre esta vez).`
        : `Consulta (NO uses el nombre de la persona, ya se lo dijiste antes).`;

      const respuestaTexto = await generarRespuestaIA(`${encabezado} Mensaje: ${texto}`, notas || null);
      await enviarRespuestaHumanizada(sock, remitente, respuestaTexto);
      estado.mensajesEnviados++;
      console.log(`✅ Respondí a: ${nombreContacto} (${remitente})`);
    } catch (err) {
      console.log('❌ Error IA:', err.message);
      await sock.sendMessage(remitente, { text: mensajeEsperaAleatorio() });
    }
  });
}

// ------------------- REVISOR DE RECORDATORIOS -------------------
setInterval(async () => {
  if (!sockActivo || recordatoriosPendientes.length === 0) return;
  const ahora = Date.now();
  for (let i = recordatoriosPendientes.length - 1; i >= 0; i--) {
    if (recordatoriosPendientes[i].tiempoEjecucion <= ahora) {
      const r = recordatoriosPendientes[i];
      try {
        await sockActivo.sendMessage(JID_DUEÑO, { text: `⏰ Recordatorio: ${r.texto}` });
      } catch (err) {
        console.log('⚠️ Error enviando recordatorio:', err.message);
      }
      recordatoriosPendientes.splice(i, 1);
    }
  }
}, 30 * 1000);
const app = express();

function obtenerInfraestructura() {
  const mem = process.memoryUsage();
  return {
    nodeVersion: process.version,
    plataforma: `${os.platform()} ${os.arch()}`,
    ramUsadaMB: Math.round(mem.rss / 1024 / 1024),
    cargaPromedio: os.loadavg()[0].toFixed(2)
  };
}

app.get('/status', (req, res) => {
  res.json({
    conectado: estado.conectado,
    uptimeSegundos: Math.floor((Date.now() - estado.inicio) / 1000),
    mensajesRecibidos: estado.mensajesRecibidos,
    mensajesEnviados: estado.mensajesEnviados,
    intentosReconexion: estado.intentosReconexion,
    ultimoError: estado.ultimoError,
    cuotaUsada: contadorCuota.usados,
    cuotaLimite: LIMITE_DIARIO_ESTIMADO,
    infraestructura: obtenerInfraestructura()
  });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>CRISS AI · Panel</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: linear-gradient(160deg, #1c1c1e 0%, #3a3a3d 40%, #0d0d0e 100%); color: #e8e8ec; font-family: 'Segoe UI', Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
  h1 { font-size: 40px; letter-spacing: 6px; font-weight: 800; background: linear-gradient(120deg, #cfd4da 0%, #ffffff 25%, #8a8f98 50%, #ffffff 75%, #cfd4da 100%); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 4px; }
  .sub { color: #9a9ea6; font-size: 13px; margin-bottom: 30px; letter-spacing: 1px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; width: 100%; max-width: 760px; }
  .card { background: linear-gradient(145deg, #2b2b2e, #1a1a1c); border: 1px solid rgba(200,205,212,0.2); border-radius: 10px; padding: 18px; text-align: center; }
  .card .valor { font-size: 24px; color: #e8e8ec; font-weight: bold; }
  .card .etiqueta { font-size: 11px; color: #9a9ea6; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; }
  .seccion-titulo { margin-top: 34px; margin-bottom: 14px; font-size: 14px; letter-spacing: 2px; color: #b8bcc4; text-transform: uppercase; }
  .estado-badge { display: inline-block; margin-top: 20px; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 13px; }
  .online { background: #1f3b2f; color: #7dffb0; border: 1px solid #7dffb0; }
  .offline { background: #3b1f1f; color: #ff8c8c; border: 1px solid #ff8c8c; }
  .barra-fondo { width: 100%; max-width: 760px; height: 14px; background: #2b2b2e; border-radius: 8px; margin-top: 10px; overflow: hidden; }
  .barra-relleno { height: 100%; background: linear-gradient(90deg, #7dffb0, #ffd27d); }
  #qr { margin-top: 25px; }
  #qr img { border-radius: 10px; border: 2px solid rgba(255,255,255,0.25); }
</style>
</head>
<body>
  <h1>CRISS AI</h1>
  <div class="sub">Panel de control · ${CREADOR}</div>
  <div id="badge" class="estado-badge offline">Cargando...</div>

  <div class="seccion-titulo">Actividad</div>
  <div class="grid">
    <div class="card"><div class="valor" id="msgIn">0</div><div class="etiqueta">Recibidos</div></div>
    <div class="card"><div class="valor" id="msgOut">0</div><div class="etiqueta">Enviados</div></div>
    <div class="card"><div class="valor" id="uptime">0s</div><div class="etiqueta">Uptime</div></div>
    <div class="card"><div class="valor" id="reint">0</div><div class="etiqueta">Reconexiones</div></div>
  </div>

  <div class="seccion-titulo">Cuota de IA hoy</div>
  <div class="grid">
    <div class="card" style="grid-column: 1 / -1">
      <div class="valor" id="cuotaTexto">0 / 0</div>
      <div class="barra-fondo"><div class="barra-relleno" id="cuotaBarra" style="width:0%"></div></div>
    </div>
  </div>

  <div class="seccion-titulo">Infraestructura</div>
  <div class="grid">
    <div class="card"><div class="valor" id="ramUsada">-</div><div class="etiqueta">RAM usada (MB)</div></div>
    <div class="card"><div class="valor" id="node">-</div><div class="etiqueta">Node.js</div></div>
    <div class="card"><div class="valor" id="plataforma">-</div><div class="etiqueta">Plataforma</div></div>
    <div class="card"><div class="valor" id="carga">-</div><div class="etiqueta">Carga promedio</div></div>
  </div>

  <div id="qr"></div>
  <script>
    async function actualizar() {
      const r = await fetch('/status');
      const d = await r.json();
      const badge = document.getElementById('badge');
      badge.textContent = d.conectado ? '● CONECTADO' : '○ DESCONECTADO';
      badge.className = 'estado-badge ' + (d.conectado ? 'online' : 'offline');
      document.getElementById('msgIn').textContent = d.mensajesRecibidos;
      document.getElementById('msgOut').textContent = d.mensajesEnviados;
      document.getElementById('reint').textContent = d.intentosReconexion;
      const h = Math.floor(d.uptimeSegundos / 3600), m = Math.floor((d.uptimeSegundos % 3600) / 60), s = d.uptimeSegundos % 60;
      document.getElementById('uptime').textContent = h + 'h ' + m + 'm ' + s + 's';

      document.getElementById('cuotaTexto').textContent = d.cuotaUsada + ' / ' + d.cuotaLimite;
      const pct = Math.min(100, Math.round((d.cuotaUsada / d.cuotaLimite) * 100));
      document.getElementById('cuotaBarra').style.width = pct + '%';

      document.getElementById('ramUsada').textContent = d.infraestructura.ramUsadaMB + ' MB';
      document.getElementById('node').textContent = d.infraestructura.nodeVersion;
      document.getElementById('plataforma').textContent = d.infraestructura.plataforma;
      document.getElementById('carga').textContent = d.infraestructura.cargaPromedio;
    }
    setInterval(actualizar, 3000);
    actualizar();
  </script>
</body>
</html>`);
});

app.get('/qr', (req, res) => {
  if (!estado.ultimoQR) return res.send('<h2 style="font-family:sans-serif">No hay QR pendiente. El bot ya está conectado o aún no se generó uno.</h2>');
  res.send(`<body style="background:#0d0d0e;display:flex;justify-content:center;align-items:center;height:100vh"><img src="${estado.ultimoQR}" /></body>`);
});

app.listen(PUERTO, () => console.log(`🌐 Panel web activo en el puerto ${PUERTO}`));

const URL_PROPIA = process.env.RENDER_EXTERNAL_URL;
if (URL_PROPIA) {
  setInterval(() => {
    fetch(URL_PROPIA)
      .then(() => console.log('🔁 Auto-ping enviado para mantener el servicio activo'))
      .catch(err => console.log('⚠️ Auto-ping falló:', err.message));
  }, 4 * 60 * 1000);
}

iniciarBot();
