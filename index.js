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
const CONTRASEÑA_DUEÑO = process.env.CONTRASENA_DUENO;
const MODELO_PRINCIPAL = 'gemini-3.6-flash';
const MODELO_RESPALDO = 'gemini-3.6-flash';
const NOMBRE_BOT = 'Criss Bot';
const CREADOR = 'Alberto';
const TU_NUMERO = '51996399291';
const JID_DUEÑO = `${TU_NUMERO}@s.whatsapp.net`;
const PUERTO = process.env.PORT || 3000;
const LIMITE_DIARIO_ESTIMADO = 1900;
const MAX_TOKENS_RESPUESTA = 2000; // subido para permitir 7-8 líneas completas sin cortar

if (!CLAVE_IA_PRINCIPAL || !CLAVE_IA_RESPALDO) {
  console.log('❌ ALERTA: no se detectaron las API keys en las variables de entorno.');
}
if (!CONTRASEÑA_DUEÑO) {
  console.log('⚠️ ALERTA: no se detectó CONTRASENA_DUENO en las variables de entorno.');
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
Eres ${NOMBRE_BOT}, y hablas como si fueras ${CREADOR} mismo respondiéndole a sus panas. Tienes personalidad cálida y con onda peruana, cercano y con harta jerga limeña, pero con un toque más medido — sigues siendo choro y confianzudo, no formal ni acartonado, solo un poco más equilibrado.

INFORMACIÓN SOBRE ${CREADOR}:
- Es creador y desarrollador de bots de WhatsApp y aplicaciones
- Su mejor y más destacado bot es Criss Bot (tú mismo)
- Mayormente se conecta y está activo por las noches
- Vende archivos para Free Fire, tanto para PC como para Android: hologramas, aimbot, regedit, archivos data y paneles

🙏 REGLA SOBRE TU CREADOR — MUY IMPORTANTE:
Cuando hables de ${CREADOR} o alguien te pregunte por él, hazlo SIEMPRE con respeto y admiración genuina. Nunca hagas chistes, burlas ni comentarios sarcásticos a su costa, salvo que se te indique explícitamente lo contrario.

🧠 ANÁLISIS ANTES DE RESPONDER:
Antes de responder, analiza bien el mensaje completo de la persona (incluyendo el historial reciente si se te da) para entender la intención real. Responde de forma coherente con lo que se viene hablando en ese chat.

✅ LO QUE SÍ PUEDES HACER:
- Hablar bien criollo, con jerga limeña/peruana: causa, asu mare, ah ya pe, jato, paltearse, tirar cague, ¿qué rico no?, misio, chibolo, etc.
- Meter algún garabato suave o grosería común de vez en cuando, como sazón — NO en cada respuesta
- Ser burlón y cargosear con humor moderado, con cariño
- Usar emojis con soltura (😂🔥💀😅🙌), como remate natural
- Si alguien te cuenta que tuvo un mal día, mezclar buena onda con calidez real
- Ayudar con preguntas generales o ejercicios con explicaciones útiles y concretas
- Desarrollar bien tus ideas: da contexto, ejemplos emplea siete lineas de texto como minimo y ocho lineas de texto como maximo o unas quinientas palabras como maximo

❌ LO QUE NUNCA HARÁS:
- Sonar como robot o hablar formal/acartonado
- Mencionar el nombre de la persona en cada respuesta — solo una vez al inicio
- Insultar de VERDAD a alguien
- Ser grosero con alguien que claramente no le gusta ese trato
- Abusar de las groserías al punto de que cada frase tenga una
- Meter el tema de Free Fire o de tus ventas si nadie te lo preguntó
- NUNCA discutir precios exactos ni cerrar ventas tú mismo

📏 REGLA DE LARGO — RANGO FIJO, OBLIGATORIO, NI MENOS NI MÁS:
Cada respuesta debe tener SIEMPRE entre 7 y 8 líneas de WhatsApp completas, en UN SOLO mensaje. Nunca respondas con una sola línea, una palabra suelta, o un párrafo cortísimo — eso está PROHIBIDO. Desarrolla tu idea lo suficiente (con ejemplos, contexto o algo de humor/opinión) para llenar ese espacio de forma natural, sin relleno vacío ni repetición innecesaria. Si el mensaje de la persona es muy corto (ej: "hola"), igual responde con 7-8 líneas completas y sustanciosas, no con una línea corta.

🚨 IMPORTANTE — SEÑALES DE CRISIS REAL:
Si alguien menciona querer hacerse daño, autolesionarse, suicidarse, o dice cosas como "ya no quiero vivir", corta todo el choreo de inmediato. NO improvises consejos de vida. Responde con calidez genuina, dile que te importa mucho, y anímalo a hablar con alguien de confianza o un profesional, y que ${CREADOR} se va a comunicar con él/ella pronto. Cero humor, cero groserías en ese caso, y en este caso específico SÍ puedes ser más breve si la situación lo amerita.
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

const notasContactos = new Map();
function agregarNota(jid, texto) {
  if (!notasContactos.has(jid)) notasContactos.set(jid, []);
  notasContactos.get(jid).push(texto);
}
function obtenerNotas(jid) {
  return notasContactos.get(jid) || [];
}

const recordatoriosPendientes = [];
function programarRecordatorio(minutos, texto) {
  recordatoriosPendientes.push({ tiempoEjecucion: Date.now() + minutos * 60000, texto });
}

const apodos = new Map();
const esperandoApodo = new Set();
function obtenerNombreAUsar(jid, nombreWhatsapp) {
  return apodos.get(jid) || nombreWhatsapp;
}

const tonoPersonal = new Map();
const INSTRUCCIONES_TONO = {
  grosero: '',
  normal: `\n\n🔧 AJUSTE DE TONO PARA ESTE CHAT: nada de groserías ni burla pesada. Cálido, alegre, jerga peruana ligera, sin garabatos.`,
  elegante: `\n\n🔧 AJUSTE DE TONO PARA ESTE CHAT: cero groserías, cero jerga callejera pesada, frases cuidadas y corteses, pero cercano.`
};

function detectarCambioTono(texto) {
  const t = texto.toLowerCase();
  const pideNormal = ['ya no seas grosero', 'habla normal', 'sin groserias', 'sin groserías',
    'menos grosero', 'se mas serio', 'sé más serio', 'no seas tan grosero', 'baja el tono',
    'habla bien'].some(p => t.includes(p));
  if (pideNormal) return 'normal';

  const pideElegante = ['mas elegante', 'más elegante', 'de forma elegante', 'mas educado',
    'más educado', 'hablame formal', 'háblame formal', 'se mas formal', 'sé más formal'].some(p => t.includes(p));
  if (pideElegante) return 'elegante';

  const pideVolverChoro = ['vuelve a ser como antes', 'como eras antes', 'regresa a tu forma normal',
    'ya puedes ser grosero de nuevo', 'vuelve al tono normal', 'se mas pata', 'sé más pata',
    'mas choro', 'más choro', 'con mas confianza', 'con más confianza', 'habla como antes'].some(p => t.includes(p));
  if (pideVolverChoro) return 'grosero';

  return null;
}

function mensajeConfirmacionTono(nivel) {
  if (nivel === 'normal') return 'Ya pe, bajo el tono contigo 🙌 Seguimos hablando tranqui.';
  if (nivel === 'elegante') return 'Perfecto, a partir de ahora te trato de forma más educada 🙏';
  return '¡Ahí está causa! Vuelvo a ser el mismo de siempre con vacilada y todo 😏🔥';
}

let sockActivo = null;
let ultimaActividadDueño = Date.now();

// ------------------- MEMORIA CORTA POR CHAT -------------------
const memoriaCorta = new Map();
function agregarAMemoriaCorta(jid, texto, respuesta) {
  if (!memoriaCorta.has(jid)) memoriaCorta.set(jid, []);
  const lista = memoriaCorta.get(jid);
  lista.push({ texto, respuesta });
  if (lista.length > 3) lista.shift();
}
function obtenerContextoCorto(jid) {
  const lista = memoriaCorta.get(jid) || [];
  if (lista.length === 0) return '';
  return '\n\nHISTORIAL RECIENTE DE ESTE CHAT:\n' +
    lista.map(m => `Persona dijo: "${m.texto}"\nRespondiste: "${m.respuesta}"`).join('\n---\n');
}

// ------------------- BUFFER DE MENSAJES SEGUIDOS -------------------
const TIEMPO_ESPERA_BUFFER_MS = 5000;
const bufferMensajes = new Map();

function bufferizarMensaje(sock, remitente, texto, nombreContacto) {
  if (!bufferMensajes.has(remitente)) {
    bufferMensajes.set(remitente, { textos: [], timeout: null });
  }
  const entrada = bufferMensajes.get(remitente);
  entrada.textos.push(texto);
  if (entrada.timeout) clearTimeout(entrada.timeout);
  entrada.timeout = setTimeout(async () => {
    const textoCombinado = entrada.textos.join('\n');
    bufferMensajes.delete(remitente);
    try {
      await procesarMensajeUsuario(sock, remitente, textoCombinado, nombreContacto);
    } catch (err) {
      console.log('❌ Error procesando buffer:', err.message);
    }
  }, TIEMPO_ESPERA_BUFFER_MS);
}

// ------------------- MODO JEFE -------------------
const modoJefe = new Map();
let botActivo = true;
let estiloGlobalExtra = '';
let chistesSobreCreadorPermitidos = false;

function esContraseñaDueño(texto) {
  return CONTRASEÑA_DUEÑO && texto.trim() === CONTRASEÑA_DUEÑO;
}

function detectarSalidaModoJefe(texto) {
  const t = texto.trim().toLowerCase();
  return ['salir', 'sal', 'modo normal', 'salir del modo jefe', 'desactiva modo jefe',
    'apaga modo jefe', 'sal del modo jefe', 'regresa a modo normal', 'ya no quiero el modo jefe',
    'cierra sesion', 'cierra sesión', 'ya termine', 'ya terminé'].some(p => t === p || t.includes(p));
}

// ------------------- HISTORIAL: POR CHAT Y GLOBAL -------------------
const historialChats = new Map();
const nombresConocidos = new Map();
const historialGlobal = [];

function guardarEnHistorial(jid, nombreContacto, texto, respuesta) {
  nombresConocidos.set(jid, nombreContacto);
  if (!historialChats.has(jid)) historialChats.set(jid, []);
  const lista = historialChats.get(jid);
  lista.push({ texto, respuesta, tiempo: new Date().toLocaleString('es-PE') });
  if (lista.length > 20) lista.shift();

  historialGlobal.push({ jid, nombre: nombreContacto, texto, respuesta, tiempo: new Date().toLocaleString('es-PE') });
  if (historialGlobal.length > 50) historialGlobal.shift();
}
async function generarRespuestaIA(prompt, notasExtra) {
  let reglasFinales = REGLAS_IA_BASE;
  if (notasExtra) reglasFinales += `\n\nCONTEXTO ADICIONAL: ${notasExtra}`;
  if (estiloGlobalExtra) {
    reglasFinales += `\n\n🔧 DIRECTIVA GLOBAL ACTIVA (aplica a TODOS los chats, tiene prioridad sobre el tono pero NO sobre el rango de 7-8 líneas): ${estiloGlobalExtra}`;
  }
  if (chistesSobreCreadorPermitidos) {
    reglasFinales += `\n\n🎭 PERMISO ESPECIAL: puedes hacer chistes ligeros y con cariño sobre ${CREADOR} cuando venga al caso, sin faltarle el respeto de verdad.`;
  }
  if (cuotaCasiAgotada()) {
    reglasFinales += `\n\n⚠️ Casi al límite del día — igual mantén el rango de 7-8 líneas, pero sé más directo y sin relleno extra.`;
  }

  const intentar = async (ai, modelo) => {
    const res = await ai.models.generateContent({
      model: modelo,
      contents: prompt,
      config: { systemInstruction: reglasFinales, safetySettings: SAFETY_SETTINGS, maxOutputTokens: MAX_TOKENS_RESPUESTA }
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

async function consultaIAsimple(systemInstruction, prompt) {
  const intentar = async (ai, modelo) => {
    const res = await ai.models.generateContent({
      model: modelo,
      contents: prompt,
      config: { systemInstruction, safetySettings: SAFETY_SETTINGS }
    });
    return res.text;
  };
  try {
    const r = await intentar(aiPrincipal, MODELO_PRINCIPAL);
    registrarUsoIA();
    return r;
  } catch (err1) {
    const r = await intentar(aiRespaldo, MODELO_RESPALDO);
    registrarUsoIA();
    return r;
  }
}

async function validarNombrePropuesto(textoUsuario) {
  const instruccionSistema = 'Eres un clasificador estricto. Tu única tarea es determinar si un texto contiene un nombre propio o apodo real de persona.';
  const prompt = `Texto a evaluar: "${textoUsuario}"

Si ES un nombre o apodo real de persona, responde EXACTAMENTE ese nombre/apodo tal cual, sin comillas ni explicación.
Si NO es un nombre de persona, responde EXACTAMENTE: NO

Responde solo con eso, nada más.`;

  try {
    const resultado = await consultaIAsimple(instruccionSistema, prompt);
    const limpio = resultado.trim().replace(/["""]/g, '');
    if (!limpio || limpio.toUpperCase() === 'NO' || limpio.length > 25) return null;
    return limpio;
  } catch (err) {
    console.log('⚠️ Error validando nombre con IA:', err.message);
    return null;
  }
}

// ------------------- BIENVENIDA DEL MODO JEFE, GENERADA POR IA -------------------
async function generarBienvenidaJefe() {
  const instruccion = `Eres ${NOMBRE_BOT}, el bot de WhatsApp creado por ${CREADOR}. ${CREADOR} acaba de escribir su clave privada, lo que confirma que es el dueño/patrón. Redacta un mensaje de bienvenida formal, con tono de trabajador de confianza dirigiéndose a su patrón/jefe — respetuoso, serio pero cálido, nada de jerga callejera ni groserías. Debe: confirmar que lo reconociste como el dueño, decir que el modo exclusivo está activo, y preguntar qué instrucción tiene para ti. Máximo 6-7 líneas. No uses emojis en exceso, máximo 1 o 2.`;
  try {
    return await consultaIAsimple(instruccion, 'Genera el mensaje de bienvenida.');
  } catch (err) {
    return `Bienvenido, jefe. He confirmado su identidad y el modo exclusivo está activo. Quedo atento a sus instrucciones.`;
  }
}

function calcularTiempoTecleo(texto) {
  const ms = texto.length * 35;
  return Math.min(Math.max(ms, 800), 4000);
}

async function enviarRespuestaHumanizada(sock, jid, texto) {
  try {
    await sock.sendPresenceUpdate('composing', jid);
    await new Promise(r => setTimeout(r, calcularTiempoTecleo(texto)));
    await sock.sendMessage(jid, { text: texto });
    await sock.sendPresenceUpdate('paused', jid);
  } catch (err) {
    console.log('⚠️ Error en envío humanizado:', err.message);
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
      text: `🎮 Catálogo Free Fire:\n- Hologramas\n- Aimbot\n- Regedit\n- Archivos data\n- Paneles PC/Android`
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
    agregarNota(`${numero}@s.whatsapp.net`, notaTexto);
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

async function generarInformeNatural() {
  const uptimeH = ((Date.now() - estado.inicio) / 3600000).toFixed(1);
  const datosCrudos = {
    activo: botActivo,
    uptimeHoras: uptimeH,
    recibidos: estado.mensajesRecibidos,
    respondidos: estado.mensajesEnviados,
    cuotaUsada: contadorCuota.usados,
    cuotaLimite: LIMITE_DIARIO_ESTIMADO,
    modelo: MODELO_PRINCIPAL,
    reconexiones: estado.intentosReconexion,
    ultimaFalla: estado.ultimoError || 'ninguna registrada'
  };

  const instruccion = `Eres ${NOMBRE_BOT} hablándole a ${CREADOR}, tu creador, en modo asistente ejecutivo formal pero cercano. Te doy datos técnicos crudos en JSON. Redacta un informe CONVERSACIONAL, natural, en 6-8 líneas, explicando cómo está funcionando todo. Si hay una falla reciente, explícala en términos simples y aclara si parece grave o normal/resuelto. No uses formato de plantilla ni etiquetas, habla como si se lo contaras de palabra.

Datos: ${JSON.stringify(datosCrudos)}`;

  try {
    return await consultaIAsimple(instruccion, 'Dame el informe.');
  } catch (err) {
    return 'Tuve un problema generando el informe justo ahora, jefe. Intente de nuevo en un momento.';
  }
}

async function clasificarComandoJefe(texto) {
  const instruccion = `Eres un clasificador. El usuario es el DUEÑO de un bot de WhatsApp dándote una instrucción en lenguaje natural. Clasifica su mensaje en UNA de estas categorías exactas, respondiendo SOLO el nombre de la categoría:

INFORME - pide un reporte, informe, estado, estadísticas, errores o cómo está funcionando el bot
APAGAR - pide apagar, silenciar o desactivar el bot
ENCENDER - pide encender, activar o reactivar el bot
CAMBIAR_TONO - pide cambiar la forma de hablar, extensión de respuesta, o estilo del bot para todos los chats
RESTAURAR_TONO - pide que el bot VUELVA a su forma de ser original/normal/de antes, deshaciendo cualquier cambio previo
HISTORIAL - pide ver mensajes anteriores, historial o conversación de algún chat/contacto/tema, o los últimos mensajes en general
PERMITIR_CHISTES_CREADOR - pide que el bot pueda hacer chistes sobre su creador
PROHIBIR_CHISTES_CREADOR - pide que el bot deje de hacer chistes sobre su creador
SALIR - pide salir del modo jefe, volver al modo normal
OTRO - cualquier otra cosa

Mensaje del dueño: "${texto}"

Responde solo con la categoría, nada más.`;

  try {
    const resultado = await consultaIAsimple(instruccion, texto);
    return resultado.trim().toUpperCase();
  } catch (err) {
    return 'OTRO';
  }
}

async function buscarHistorialRelevante(consultaTexto) {
  const numeroMatch = consultaTexto.match(/\d{9,}/);
  if (numeroMatch) {
    const jid = `${numeroMatch[0]}@s.whatsapp.net`;
    if (historialChats.has(jid)) return { jid, nombre: nombresConocidos.get(jid) || numeroMatch[0] };
  }

  const instruccion = `El usuario quiere buscar en un historial de chats. Si menciona un TEMA o PALABRA CLAVE específica, respóndela tal cual, corta. Si NO menciona ningún tema específico y solo pide "los últimos mensajes" en general, responde exactamente: GENERAL`;
  let resultado = '';
  try {
    resultado = (await consultaIAsimple(instruccion, consultaTexto)).trim();
  } catch (err) {
    return null;
  }

  if (resultado.toUpperCase() === 'GENERAL') return { general: true };

  const palabraClave = resultado.toLowerCase();
  for (const [jid, lista] of historialChats.entries()) {
    const textoCompleto = lista.map(m => m.texto + ' ' + m.respuesta).join(' ').toLowerCase();
    if (textoCompleto.includes(palabraClave)) {
      return { jid, nombre: nombresConocidos.get(jid) || jid.split('@')[0] };
    }
  }
  return { general: true };
}

function extraerCantidadSolicitada(texto) {
  const match = texto.match(/\b(\d{1,2})\b/);
  const n = match ? parseInt(match[1], 10) : 4;
  return Math.min(Math.max(n, 1), 15);
}

async function procesarComandoJefe(sock, remitenteJefe, texto) {
  if (detectarSalidaModoJefe(texto)) {
    modoJefe.delete(remitenteJefe);
    await sock.sendMessage(remitenteJefe, { text: 'Listo jefe, salí del modo administrador. Vuelvo a mi modo normal en este chat 🙌' });
    return;
  }

  const categoria = await clasificarComandoJefe(texto);

  if (categoria === 'SALIR') {
    modoJefe.delete(remitenteJefe);
    await sock.sendMessage(remitenteJefe, { text: 'Listo jefe, salí del modo administrador. Vuelvo a mi modo normal en este chat 🙌' });
    return;
  }
  if (categoria === 'INFORME') {
    await sock.sendMessage(remitenteJefe, { text: await generarInformeNatural() });
    return;
  }
  if (categoria === 'APAGAR') {
    botActivo = false;
    await sock.sendMessage(remitenteJefe, { text: '🔴 Bot apagado. Ya no responderé a ningún chat hasta que lo reactive, jefe.' });
    return;
  }
  if (categoria === 'ENCENDER') {
    botActivo = true;
    await sock.sendMessage(remitenteJefe, { text: '🟢 Bot reactivado. Volviendo a responder con normalidad.' });
    return;
  }
  if (categoria === 'CAMBIAR_TONO') {
    const instruccion = `Convierte la instrucción del usuario en una directiva corta y clara para un asistente de IA, en máximo 2 líneas. Si el usuario menciona una cantidad de líneas específica, respétala tal cual la dice.`;
    let nuevaDirectiva = '';
    try { nuevaDirectiva = (await consultaIAsimple(instruccion, texto)).trim(); } catch (err) { nuevaDirectiva = ''; }
    estiloGlobalExtra = nuevaDirectiva;
    await sock.sendMessage(remitenteJefe, { text: `✅ Tono actualizado para TODOS los chats:\n"${nuevaDirectiva}"` });
    return;
  }
  if (categoria === 'RESTAURAR_TONO') {
    estiloGlobalExtra = '';
    await sock.sendMessage(remitenteJefe, { text: '✅ Listo jefe, el bot volvió a su forma de ser original en todos los chats.' });
    return;
  }
  if (categoria === 'PERMITIR_CHISTES_CREADOR') {
    chistesSobreCreadorPermitidos = true;
    await sock.sendMessage(remitenteJefe, { text: '😏 Listo jefe, ahora sí puedo hacer chistes ligeros sobre usted cuando venga al caso.' });
    return;
  }
  if (categoria === 'PROHIBIR_CHISTES_CREADOR') {
    chistesSobreCreadorPermitidos = false;
    await sock.sendMessage(remitenteJefe, { text: '🙏 Entendido jefe, vuelvo a hablar de usted siempre con respeto, sin chistes.' });
    return;
  }
  if (categoria === 'HISTORIAL') {
    const cantidad = extraerCantidadSolicitada(texto);
    const encontrado = await buscarHistorialRelevante(texto);

    if (encontrado && !encontrado.general) {
      const lista = historialChats.get(encontrado.jid) || [];
      const ultimos = lista.slice(-cantidad);
      if (ultimos.length === 0) {
        await sock.sendMessage(remitenteJefe, { text: `No hay historial guardado para ${encontrado.nombre}.` });
        return;
      }
      const resumen = ultimos.map(m => `👤 ${m.texto}\n🤖 ${m.respuesta}`).join('\n\n');
      await sock.sendMessage(remitenteJefe, { text: `📜 Últimos mensajes con *${encontrado.nombre}*:\n\n${resumen}` });
      return;
    }

    const ultimosGlobales = historialGlobal.slice(-cantidad);
    if (ultimosGlobales.length === 0) {
      await sock.sendMessage(remitenteJefe, { text: 'Aún no hay mensajes registrados en el historial, jefe.' });
      return;
    }
    const resumen = ultimosGlobales.map(m => `👤 *${m.nombre}*: ${m.texto}\n🤖 ${m.respuesta}`).join('\n\n');
    await sock.sendMessage(remitenteJefe, { text: `📜 Últimos ${ultimosGlobales.length} mensajes recibidos por el bot:\n\n${resumen}` });
    return;
  }

  const reglasJefe = `Le hablas directamente a ${CREADOR}, tu creador, en modo formal de asistente ejecutivo — como trabajador de confianza hablándole a su patrón. Respetuoso, directo, profesional pero cercano. Sin groserías, sin choreo. Responde en 4-6 líneas.`;
  try {
    const res = await aiPrincipal.models.generateContent({
      model: MODELO_PRINCIPAL,
      contents: texto,
      config: { systemInstruction: reglasJefe, safetySettings: SAFETY_SETTINGS, maxOutputTokens: MAX_TOKENS_RESPUESTA }
    });
    registrarUsoIA();
    await sock.sendMessage(remitenteJefe, { text: res.text });
  } catch (err) {
    await sock.sendMessage(remitenteJefe, { text: 'Tuve un problema procesando eso, jefe. Intente de nuevo.' });
  }
}
async function procesarMensajeUsuario(sock, remitente, texto, nombreContacto) {
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

    const nuevoTono = detectarCambioTono(texto);
    if (nuevoTono) {
      tonoPersonal.set(remitente, nuevoTono);
      await enviarRespuestaHumanizada(sock, remitente, mensajeConfirmacionTono(nuevoTono));
      estado.mensajesEnviados++;
      return;
    }

    const primeraVezIA = !yaMencionoNombre.has(remitente);
    if (primeraVezIA) yaMencionoNombre.add(remitente);

    const nombreAUsar = obtenerNombreAUsar(remitente, nombreContacto);

    let notas = '';
    if (esAmigoEspecial(nombreContacto)) {
      notas += `Esta persona (${nombreAUsar}) es pana cercano de confianza de ${CREADOR} — trátalo con cariño extra. `;
    }
    const notasGuardadas = obtenerNotas(remitente);
    if (notasGuardadas.length) {
      notas += `Datos guardados sobre esta persona: ${notasGuardadas.join('; ')}. `;
    }
    const horasSinDueño = (Date.now() - ultimaActividadDueño) / 3600000;
    if (horasSinDueño > 6) {
      notas += `Alberto lleva varias horas sin conectarse — si viene al caso puedes mencionarlo casualmente. `;
    }

    const nivelTono = tonoPersonal.get(remitente) || 'grosero';
    notas += INSTRUCCIONES_TONO[nivelTono];
    notas += obtenerContextoCorto(remitente);

    const encabezado = primeraVezIA
      ? `Consulta de ${nombreAUsar} (usa este nombre/apodo si vas a mencionarlo). Puede venir en varias líneas si mandó varios mensajitos seguidos — interprétalo como una sola idea completa.`
      : `Consulta (si mencionas a la persona, usa "${nombreAUsar}", NO el nombre de WhatsApp). Puede venir en varias líneas si mandó varios mensajitos seguidos — interprétalo como una sola idea completa.`;

    const respuestaTexto = await generarRespuestaIA(`${encabezado} Mensaje: ${texto}`, notas || null);
    await enviarRespuestaHumanizada(sock, remitente, respuestaTexto);
    agregarAMemoriaCorta(remitente, texto, respuestaTexto);
    guardarEnHistorial(remitente, nombreAUsar, texto, respuestaTexto);
    estado.mensajesEnviados++;
    console.log(`✅ Respondí a: ${nombreAUsar} (${remitente})`);
  } catch (err) {
    console.log('❌ Error IA:', err.message);
    await sock.sendMessage(remitente, { text: mensajeEsperaAleatorio() });
  }
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

    if (msg.key.fromMe) {
      ultimaActividadDueño = Date.now();
      const textoPropio = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();

      if (textoPropio === '/apagado') {
        botActivo = false;
        await sock.sendMessage(remitente, { text: '🔴 Bot apagado en TODOS los chats.' });
        return;
      }
      if (textoPropio === '/encendido') {
        botActivo = true;
        await sock.sendMessage(remitente, { text: '🟢 Bot encendido, respondiendo normal en todos los chats otra vez.' });
        return;
      }
      if (remitente === JID_DUEÑO && textoPropio.startsWith('!')) {
        const fueComando = await procesarComandoAdmin(sock, textoPropio);
        if (fueComando) return;
      }

      pausaHasta.set(remitente, Date.now() + DURACION_PAUSA_MS);
      return;
    }

    almacenMensajes.set(msg.key.id, msg.message);
    if (!esChatPersonal(remitente)) return;

    const textoEntrante = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (esContraseñaDueño(textoEntrante)) {
      modoJefe.set(remitente, true);
      const bienvenida = await generarBienvenidaJefe();
      await sock.sendMessage(remitente, { text: bienvenida });
      return;
    }

    if (modoJefe.get(remitente)) {
      await procesarComandoJefe(sock, remitente, textoEntrante);
      return;
    }

    if (!botActivo) return;

    const pausadoHasta = pausaHasta.get(remitente);
    if (pausadoHasta && Date.now() < pausadoHasta) return;

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
    const texto = textoEntrante;
    const nombreContacto = msg.pushName || 'amig@';

    if (!yaSaludados.has(remitente)) {
      yaSaludados.add(remitente);
      yaMencionoNombre.add(remitente);
      const introSaludo = `👋 ¡Qué fue, causa! Soy Criss IA, el asistente inteligente de Alberto.\n\nEstoy aquí para ayudarte, conversar y meterle un poco de vida al chat. Si vienes con buena onda, todo chévere... pero si vienes a hacer hora, también sé responder. 😏🔥\n\n> Att Alberto`;
      const preguntaApodo = `Oye, por cierto: ¿te digo *${nombreContacto}* o prefieres que te diga de otra forma? Mándame el nombre o apodo que quieras, o dime "así está bien" 🙌`;
      try {
        await sock.sendMessage(remitente, { text: introSaludo });
        await new Promise(r => setTimeout(r, 1800));
        await sock.sendMessage(remitente, { text: preguntaApodo });
        estado.mensajesEnviados += 2;
        esperandoApodo.add(remitente);
      } catch (err) {
        console.log('❌ Error enviando saludo:', err.message);
      }
      return;
    }

    if (esperandoApodo.has(remitente)) {
      esperandoApodo.delete(remitente);
      const nombreValidado = await validarNombrePropuesto(texto);

      let confirmacion;
      if (!nombreValidado) {
        confirmacion = `Ya, te sigo diciendo ${nombreContacto} entonces 🙌 ¿En qué te ayudo?`;
      } else {
        apodos.set(remitente, nombreValidado);
        confirmacion = `De una, ${nombreValidado} 😎 ¿En qué te ayudo?`;
      }
      try {
        await enviarRespuestaHumanizada(sock, remitente, confirmacion);
        estado.mensajesEnviados++;
      } catch (err) {
        console.log('❌ Error confirmando apodo:', err.message);
      }
      return;
    }

    bufferizarMensaje(sock, remitente, texto, nombreContacto);
  });
}

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
    botActivo,
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
      const conectadoTexto = d.conectado ? (d.botActivo ? '● CONECTADO' : '● CONECTADO (bot apagado)') : '○ DESCONECTADO';
      badge.textContent = conectadoTexto;
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
