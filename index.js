const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const http = require('http');
const https = require('https');

const OWNER_NUMBER = '51975922748';
const BOT_NAME = 'CRISS BOT';
const CONFIG_FILE = 'config.json';
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN || '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';

let config = { activo: true, antilink: false, antispam: false, welcome: true, bye: true, cmd: true };
if (fs.existsSync(CONFIG_FILE)) config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_FILE)) };
const saveConfig = () => fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));

const stats = { mensajes: 0, comandos: 0, entradas: 0, salidas: 0 };
let botConectado = false;
let reconectando = false;
let intentos = 0;
const warns = {};
const bans = {};
const startTime = Date.now();

const FIRMA = `
╭━━━〔 ⚡ CRISS BOT ⚡ 〕━━━⬣
┃ 👑 Creador: Albert Oficial
┃ 🎂 Edad: 18
┃ 💻 Programador en proceso
┃ 🤖 Bot Status: Online
┃ 📞 Contacto: +51 996 399 291
┃ ❤️ Mis variables indican: K❤️
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 👨‍💻 MENSAJE DEL CREADOR 〕━━⬣
┃ Hola, soy Albert Oficial,
┃ creador de apps, sitios web,
┃ usuario de Linux.
┃
┃ La programación no es solo
┃ un código, es crear algo
┃ único desde cero...
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 ⚙️ ESPECIALIDADES 〕━━⬣
┃ ➤ WHATSAPP BOTS
┃ ➤ PROGRAMACIÓN
┃ ➤ SITIOS WEB
┃ ➤ LINUX & SISTEMAS
╰━━━━━━━━━━━━━━━━━━⬣

⚡ CRISS BOT BY ALBERT OFICIAL ⚡`;

const INFO_PRIVADO = `
╭━━━〔 ⚡ CRISS BOT ⚡ 〕━━━⬣
┃ 👋 Hola! Me escribiste al privado
┃ Soy CRISS BOT, creado por:
┃ 👑 Albert Oficial
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 👨‍💻 SOBRE EL CREADOR 〕━━⬣
┃ 🎂 Edad: 18 años
┃ 💻 Programador en proceso
┃ 📞 +51 996 399 291
┃ 🌎 Perú 🇵🇪
┃ 🚀 Especialista en bots
┃ 🌐 Desarrollo web y apps
┃ 🐧 Usuario de Linux
┃ ❤️ Variables indican: K❤️
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 📋 COMANDOS 〕━━⬣
┃ Escribe /help para ver todo
╰━━━━━━━━━━━━━━━━━━⬣

⚡ CRISS BOT BY ALBERT OFICIAL ⚡`;

const chistes = [
  'Por que el programador se fue a casa? Porque no encontraba el array. 🏠',
  'Mi codigo no tiene bugs, tiene caracteristicas no documentadas. ✨',
  'Por que los programadores confunden Halloween con Navidad? Oct 31 = Dec 25. 🎃',
  'Le pregunte a mi novia si me queria y me dijo: undefined. 💔',
  'Como se despide un programador? Hasta el break! 👋',
  'Un programador tiene un problema. Usa threads. Ahora tiene problemos. 😂',
  'Mi mama me dijo que hiciera algo con mi vida... le hice un bucle infinito. 🔄',
  'Cual es el animal favorito del programador? El bug. 🐛',
  'Mi ex era como javascript: promesas que nunca se cumplen. 💀',
  'Le pregunte a ChatGPT si tenia sentimientos. Me dijo que no. Yo llore. 😢',
  'Un QA entra a un bar y pide 0, 999, -1 cervezas y una lagartija. 🦎',
  'Por que los programadores odian la naturaleza? Tiene demasiados bugs. 🌿',
  'Soy tan pobre que cuando roban mi codigo me hacen backup. 💾',
  'Mi novia me dejo por programar mucho. No me importo, igual era undefined. 💔',
];

const frasesRetiro = [
  'Otro que huyo antes de que llegara la cuenta. 😂',
  'Se fue tan rapido que dejo los zapatos. 👟',
  'Se fue al baño y nunca volvio. 🚽',
  'Adios, que te vaya bien en tu vida de ermitaño. 🏔️',
  'El grupo lo traumatizo tanto que desaparecio. 💀',
  'Dejo el grupo como tu ex: sin explicacion. 💔',
  'Se fue mas rapido que mi ex cuando supo que era pobre. 😂',
  'Otro cobarde que no aguanto la presion. 🏃',
];

async function generarImagen(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ inputs: prompt });
    const options = {
      hostname: 'api-inference.huggingface.co',
      path: '/models/stabilityai/stable-diffusion-2-1',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + HF_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (res.headers['content-type']?.includes('image')) {
          resolve(buffer);
        } else {
          reject(new Error('No se pudo generar la imagen: ' + buffer.toString()));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const PANEL_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CRISS BOT — Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap" rel="stylesheet">
<style>
:root{--verde:#00ff88;--rojo:#ff3366;--cyan:#00e5ff;--fondo:#050a0e;--panel:#0a1520;--borde:#0d2535;--texto:#a0c4d8}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--fondo);font-family:'Rajdhani',sans-serif;color:var(--texto);min-height:100vh}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 40% at 50% 0%,rgba(0,229,255,.07) 0%,transparent 60%);pointer-events:none;z-index:0}
body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
.container{position:relative;z-index:1;max-width:480px;margin:0 auto;padding:20px 16px 40px}
.header{text-align:center;padding:30px 0 20px}
.logo-ring{width:90px;height:90px;margin:0 auto 16px;position:relative}
.logo-ring svg{width:100%;height:100%;animation:spin 8s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.logo-inner{position:absolute;inset:12px;background:var(--panel);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;border:1px solid var(--borde)}
.titulo{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;letter-spacing:4px;color:#fff;text-shadow:0 0 20px rgba(0,229,255,.5)}
.subtitulo{font-size:12px;letter-spacing:3px;color:var(--cyan);opacity:.6;margin-top:4px;text-transform:uppercase}
.card{background:var(--panel);border:1px solid var(--borde);border-radius:16px;padding:20px;margin-bottom:16px;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.4}
.card-titulo{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:3px;color:var(--cyan);opacity:.6;margin-bottom:14px;text-transform:uppercase}
.estado-row{display:flex;align-items:center;justify-content:space-between}
.estado-info{display:flex;align-items:center;gap:12px}
.punto{width:14px;height:14px;border-radius:50%;flex-shrink:0}
.punto.activo{background:var(--verde);box-shadow:0 0 12px var(--verde);animation:pulso 1.5s ease-in-out infinite}
.punto.inactivo{background:var(--rojo);box-shadow:0 0 12px var(--rojo)}
@keyframes pulso{0%,100%{box-shadow:0 0 8px var(--verde)}50%{box-shadow:0 0 20px var(--verde)}}
.estado-texto{font-family:'Orbitron',monospace;font-size:15px;font-weight:700;color:#fff}
.estado-sub{font-size:12px;opacity:.5;margin-top:2px}
.toggle-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
.toggle{width:56px;height:28px;background:rgba(255,51,102,.2);border:1px solid var(--rojo);border-radius:14px;cursor:pointer;position:relative;transition:all .3s}
.toggle.on{background:rgba(0,255,136,.15);border-color:var(--verde)}
.toggle-ball{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:var(--rojo);transition:all .3s;box-shadow:0 0 8px var(--rojo)}
.toggle.on .toggle-ball{left:31px;background:var(--verde);box-shadow:0 0 8px var(--verde)}
.toggle-label{font-family:'Orbitron',monospace;font-size:8px;letter-spacing:1px;opacity:.5}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stat-box{background:rgba(0,229,255,.04);border:1px solid var(--borde);border-radius:10px;padding:14px 12px;text-align:center}
.stat-num{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:var(--cyan)}
.stat-label{font-size:10px;opacity:.5;margin-top:4px;text-transform:uppercase}
.btn-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.btn{padding:14px 10px;border-radius:10px;border:1px solid;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;font-weight:700;cursor:pointer;text-transform:uppercase;background:transparent;display:flex;flex-direction:column;align-items:center;gap:6px}
.btn span.icon{font-size:18px}
.btn-cyan{border-color:var(--cyan);color:var(--cyan)}
.btn-verde{border-color:var(--verde);color:var(--verde)}
.btn-rojo{border-color:var(--rojo);color:var(--rojo)}
.btn-amarillo{border-color:#ffcc00;color:#ffcc00}
.conexion-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;font-size:11px;font-family:'Orbitron',monospace}
.badge-ok{background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.3);color:var(--verde)}
.badge-err{background:rgba(255,51,102,.08);border:1px solid rgba(255,51,102,.3);color:var(--rojo)}
.puntito{width:6px;height:6px;border-radius:50%;background:currentColor}
.logs-box{background:#020810;border:1px solid var(--borde);border-radius:10px;padding:12px;height:160px;overflow-y:auto;font-family:monospace;font-size:11px;line-height:1.6}
.log-ok{color:var(--verde)}.log-err{color:var(--rojo)}.log-info{color:var(--cyan)}.log-warn{color:#ffcc00}
.footer{text-align:center;margin-top:24px;font-size:10px;letter-spacing:2px;opacity:.3;text-transform:uppercase}
.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--panel);border:1px solid var(--cyan);color:var(--cyan);padding:10px 20px;border-radius:30px;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;transition:transform .3s;z-index:100;white-space:nowrap}
.toast.show{transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-ring">
      <svg viewBox="0 0 90 90" fill="none"><circle cx="45" cy="45" r="42" stroke="url(#g1)" stroke-width="1.5" stroke-dasharray="6 4"/><defs><linearGradient id="g1" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00e5ff"/><stop offset="50%" stop-color="#00ff88"/><stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/></linearGradient></defs></svg>
      <div class="logo-inner">⚡</div>
    </div>
    <div class="titulo">CRISS BOT</div>
    <div class="subtitulo">Panel de Control — Albert Oficial</div>
  </div>
  <div class="card">
    <div class="card-titulo">◈ Estado del Sistema</div>
    <div class="estado-row">
      <div class="estado-info">
        <div class="punto activo" id="puntoBotEstado"></div>
        <div><div class="estado-texto" id="textoEstado">ACTIVO</div><div class="estado-sub" id="subEstado">Respondiendo mensajes</div></div>
      </div>
      <div class="toggle-wrap">
        <div class="toggle on" id="toggleBot" onclick="toggleBot()"><div class="toggle-ball"></div></div>
        <div class="toggle-label">ON/OFF</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-titulo">◈ Conexión WhatsApp</div>
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span class="conexion-badge badge-ok" id="badgeConexion"><span class="puntito"></span><span id="textoConexion">Conectado</span></span>
      <span style="font-size:11px;opacity:.4;" id="tiempoActivo">Uptime: 00:00:00</span>
    </div>
  </div>
  <div class="card">
    <div class="card-titulo">◈ Estadísticas</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-num" id="statMensajes">0</div><div class="stat-label">Mensajes</div></div>
      <div class="stat-box"><div class="stat-num" id="statComandos">0</div><div class="stat-label">Comandos</div></div>
      <div class="stat-box"><div class="stat-num" id="statEntradas">0</div><div class="stat-label">Entradas</div></div>
      <div class="stat-box"><div class="stat-num" id="statSalidas">0</div><div class="stat-label">Salidas</div></div>
    </div>
  </div>
  <div class="btn-row">
    <button class="btn btn-verde" onclick="accion('reiniciar')"><span class="icon">🔄</span>Reiniciar</button>
    <button class="btn btn-rojo" onclick="accion('limpiarSesion')"><span class="icon">🗑️</span>Nuevo QR</button>
    <button class="btn btn-cyan" onclick="accion('estado')"><span class="icon">📊</span>Verificar</button>
    <button class="btn btn-amarillo" onclick="limpiarLogs()"><span class="icon">🧹</span>Limpiar Log</button>
  </div>
  <div class="card">
    <div class="card-titulo" style="display:flex;justify-content:space-between;"><span>◈ Registro en Vivo</span></div>
    <div class="logs-box" id="logsBox"><div class="log-line log-info">▶ Panel CRISS BOT iniciado...</div></div>
  </div>
  <div class="footer">CRISS BOT — Albert Oficial ⚡</div>
</div>
<div class="toast" id="toast"></div>
<script>
let botActivo=true,inicioBot=Date.now();
function mostrarToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
function agregarLog(texto,tipo='info'){const box=document.getElementById('logsBox');const l=document.createElement('div');l.className='log-line log-'+tipo;l.textContent='['+new Date().toLocaleTimeString('es-PE')+'] '+texto;box.appendChild(l);box.scrollTop=box.scrollHeight}
function limpiarLogs(){document.getElementById('logsBox').innerHTML='';agregarLog('Log limpiado','info');mostrarToast('✓ LOG LIMPIADO')}
function actualizarUI(activo){botActivo=activo;const p=document.getElementById('puntoBotEstado'),t=document.getElementById('toggleBot'),e=document.getElementById('textoEstado'),s=document.getElementById('subEstado');if(activo){p.className='punto activo';t.className='toggle on';e.textContent='ACTIVO';e.style.color='var(--verde)';s.textContent='Respondiendo mensajes'}else{p.className='punto inactivo';t.className='toggle';e.textContent='INACTIVO';e.style.color='var(--rojo)';s.textContent='Bot pausado'}}
async function toggleBot(){try{const r=await fetch('/toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({activo:!botActivo})});const d=await r.json();actualizarUI(d.activo);agregarLog(d.activo?'Bot activado':'Bot desactivado',d.activo?'ok':'err');mostrarToast(d.activo?'✓ ACTIVADO':'✗ DESACTIVADO')}catch(e){mostrarToast('⚠ ERROR')}}
async function accion(tipo){try{if(tipo==='reiniciar'){agregarLog('Reiniciando...','warn');await fetch('/reiniciar',{method:'POST'})}else if(tipo==='limpiarSesion'){agregarLog('Nuevo QR...','warn');await fetch('/nuevo-qr',{method:'POST'})}else if(tipo==='estado'){await obtenerEstado();mostrarToast('✓ ACTUALIZADO')}}catch(e){mostrarToast('⚠ ERROR')}}
async function obtenerEstado(){try{const r=await fetch('/estado');const d=await r.json();actualizarUI(d.activo);if(d.stats){document.getElementById('statMensajes').textContent=d.stats.mensajes||0;document.getElementById('statComandos').textContent=d.stats.comandos||0;document.getElementById('statEntradas').textContent=d.stats.entradas||0;document.getElementById('statSalidas').textContent=d.stats.salidas||0}const b=document.getElementById('badgeConexion'),c=document.getElementById('textoConexion');if(d.conectado){b.className='conexion-badge badge-ok';c.textContent='Conectado'}else{b.className='conexion-badge badge-err';c.textContent='Desconectado'}}catch(e){}}
setInterval(obtenerEstado,5000);
setInterval(()=>{const s=Math.floor((Date.now()-inicioBot)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;document.getElementById('tiempoActivo').textContent='Uptime: '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sc).padStart(2,'0')},1000);
obtenerEstado();agregarLog('Panel CRISS BOT iniciado','ok');
</script>
</body>
</html>`;
function iniciarServidor() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
    if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(PANEL_HTML); return; }
    if (req.method === 'GET' && req.url === '/estado') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ activo: config.activo, conectado: botConectado, stats })); return; }
    if (req.method === 'POST' && req.url === '/toggle') {
      let body = '';
      req.on('data', d => body += d);
      req.on('end', () => { try { const d = JSON.parse(body); config.activo = d.activo; saveConfig(); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ activo: config.activo })); } catch(e) { res.writeHead(400); res.end('{}'); } });
      return;
    }
    if (req.method === 'POST' && req.url === '/reiniciar') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); setTimeout(() => process.exit(0), 500); return; }
    if (req.method === 'POST' && req.url === '/nuevo-qr') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); setTimeout(() => { try { fs.rmSync('auth_info', { recursive: true, force: true }); } catch(e) {} process.exit(0); }, 500); return; }
    res.writeHead(404); res.end('Not found');
  });
  server.listen(PORT, '0.0.0.0', () => console.log('🌐 Panel CRISS BOT: http://localhost:' + PORT));
}

async function startBot() {
  if (reconectando) return;
  reconectando = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false, keepAliveIntervalMs: 15000, connectTimeoutMs: 60000 });
    reconectando = false;
    intentos = 0;

    const esAdmin = async (jid, from) => {
      try { const meta = await sock.groupMetadata(from); return meta.participants.find(p => p.id === jid)?.admin != null; } catch { return false; }
    };

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) { console.log('\n📱 Escanea QR:\n'); qrcode.generate(qr, { small: true }); }
      if (connection === 'close') {
        botConectado = false;
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) { console.log('❌ Sesión cerrada.'); return; }
        intentos++;
        if (intentos > 10) { try { fs.rmSync('auth_info', { recursive: true, force: true }); } catch(e) {} intentos = 0; }
        setTimeout(() => { reconectando = false; startBot(); }, Math.min(intentos * 3000, 15000));
      }
      if (connection === 'open') { botConectado = true; intentos = 0; console.log('\n✅ CRISS BOT conectado!\n'); }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
      try {
        if ((action === 'remove' || action === 'leave') && config.bye) {
          stats.salidas++;
          const num = participants[0].replace('@s.whatsapp.net', '');
          const frase = frasesRetiro[Math.floor(Math.random() * frasesRetiro.length)];
          let ppUrl = null;
          try { ppUrl = await sock.profilePictureUrl(participants[0], 'image'); } catch {}
          const txt = '👋 *+' + num + '* salió del grupo.\n\n😂 ' + frase + '\n' + FIRMA;
          if (ppUrl) {
            await sock.sendMessage(id, { image: { url: ppUrl }, caption: txt });
          } else {
            await sock.sendMessage(id, { text: txt });
          }
        }
        if (action === 'add' && config.welcome) {
          stats.entradas++;
          for (const p of participants) {
            const num = p.replace('@s.whatsapp.net', '');
            let ppUrl = null;
            try { ppUrl = await sock.profilePictureUrl(p, 'image'); } catch {}
            const txt = '🎉 *¡Bienvenido/a al grupo!*\n\n' +
              '👤 Número: *+' + num + '*\n' +
              '📱 WhatsApp: wa.me/' + num + '\n' +
              '🌟 Escribe */help* para ver los comandos.\n' + FIRMA;
            if (ppUrl) {
              await sock.sendMessage(id, { image: { url: ppUrl }, caption: txt, mentions: [p] });
            } else {
              await sock.sendMessage(id, { text: txt, mentions: [p] });
            }
          }
        }
      } catch(e) { console.log('Error grupo:', e.message); }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        stats.mensajes++;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.replace('@s.whatsapp.net', '');
        const esOwner = senderNumber === OWNER_NUMBER;
        const adminCheck = isGroup ? await esAdmin(sender, from) : true;
        const esAdminOOwner = esOwner || adminCheck;

        const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const body = texto.trim();
        const comando = body.split(' ')[0].toLowerCase();
        const args = body.split(' ').slice(1);
        const bodyLower = body.toLowerCase();

        const responder = (text) => { stats.comandos++; return sock.sendMessage(from, { text }, { quoted: msg }); };

        // Mensaje privado — mostrar foto + info
        if (!isGroup && !esOwner) {
          let ppUrl = null;
          try { ppUrl = await sock.profilePictureUrl(sender, 'image'); } catch {}
          if (ppUrl) {
            await sock.sendMessage(from, { image: { url: ppUrl }, caption: INFO_PRIVADO });
          } else {
            await sock.sendMessage(from, { text: INFO_PRIVADO });
          }
        }

        if (!config.activo && !esOwner) return;
        if (comando.startsWith('/') || comando.startsWith('!')) stats.comandos++;

        // OWNER
        if (esOwner) {
          if (comando === '/bot' && args[0] === 'on') { config.activo = true; saveConfig(); responder('✅ Bot activado.\n' + FIRMA); return; }
          if (comando === '/bot' && args[0] === 'off') { config.activo = false; saveConfig(); responder('🔴 Bot desactivado.\n' + FIRMA); return; }
          if (comando === '/logs') { responder('📋 Stats:\n📨 ' + stats.mensajes + '\n⚡ ' + stats.comandos + '\n👋 ' + stats.entradas + '\n🚪 ' + stats.salidas + '\n' + FIRMA); return; }
          if (comando === '/ownerhelp') { responder('👑 *Owner:*\n/bot on|off\n/logs\n/ownerhelp\n' + FIRMA); return; }
        }

        if (!config.activo && !esOwner) return;

        // ADMIN
        if (esAdminOOwner && isGroup) {
          if (comando === '/kick') { if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) return responder('Menciona a alguien.'); for (const m of msg.message.extendedTextMessage.contextInfo.mentionedJid) { await sock.groupParticipantsUpdate(from, [m], 'remove'); } responder('👢 Expulsado.\n' + FIRMA); return; }
          if (comando === '/add') { if (!args.length) return responder('Uso: /add 51999999999'); await sock.groupParticipantsUpdate(from, [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net'], 'add'); responder('✅ Agregado.\n' + FIRMA); return; }
          if (comando === '/promote') { if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) return responder('Menciona a alguien.'); for (const m of msg.message.extendedTextMessage.contextInfo.mentionedJid) { await sock.groupParticipantsUpdate(from, [m], 'promote'); } responder('⬆️ Promovido.\n' + FIRMA); return; }
          if (comando === '/demote') { if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) return responder('Menciona a alguien.'); for (const m of msg.message.extendedTextMessage.contextInfo.mentionedJid) { await sock.groupParticipantsUpdate(from, [m], 'demote'); } responder('⬇️ Degradado.\n' + FIRMA); return; }
          if (comando === '/ban') { if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) return responder('Menciona a alguien.'); for (const m of msg.message.extendedTextMessage.contextInfo.mentionedJid) { bans[m] = true; await sock.groupParticipantsUpdate(from, [m], 'remove'); } responder('🚫 Baneado.\n' + FIRMA); return; }
          if (comando === '/mute') { await sock.groupSettingUpdate(from, 'announcement'); responder('🔇 Grupo silenciado.\n' + FIRMA); return; }
          if (comando === '/unmute') { await sock.groupSettingUpdate(from, 'not_announcement'); responder('🔊 Grupo abierto.\n' + FIRMA); return; }
          if (comando === '/tagall' || comando === '/invocar') {
            const meta = await sock.groupMetadata(from);
            const todos = meta.participants.map(p => p.id);
            await sock.sendMessage(from, { text: '📢 *Invocando a todos:*\n\n' + todos.map(p => '@' + p.replace('@s.whatsapp.net','')).join('\n') + '\n' + FIRMA, mentions: todos });
            return;
          }
          if (comando === '/admins') { const meta = await sock.groupMetadata(from); responder('👑 *Admins:*\n\n' + meta.participants.filter(p=>p.admin).map(p=>'@'+p.id.replace('@s.whatsapp.net','')).join('\n') + '\n' + FIRMA); return; }
          if (comando === '/warn') {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (!mentioned.length) return responder('Menciona a alguien.');
            const m = mentioned[0];
            if (!warns[from]) warns[from] = {};
            warns[from][m] = (warns[from][m] || 0) + 1;
            if (warns[from][m] >= 3) { await sock.groupParticipantsUpdate(from, [m], 'remove'); responder('🚫 3 warns — expulsado.\n' + FIRMA); }
            else { responder('⚠️ Advertencia ' + warns[from][m] + '/3\n' + FIRMA); }
            return;
          }
          if (comando === '/antilink') { config.antilink = args[0]==='on'; saveConfig(); responder('🔗 Antilink: '+(config.antilink?'ON':'OFF')+'\n'+FIRMA); return; }
          if (comando === '/welcome') { config.welcome = args[0]==='on'; saveConfig(); responder('👋 Bienvenidas: '+(config.welcome?'ON':'OFF')+'\n'+FIRMA); return; }
          if (comando === '/bye') { config.bye = args[0]==='on'; saveConfig(); responder('🚪 Despedidas: '+(config.bye?'ON':'OFF')+'\n'+FIRMA); return; }
          if (comando === '/linkgrupo') { const link = await sock.groupInviteCode(from); responder('🔗 https://chat.whatsapp.com/'+link+'\n'+FIRMA); return; }
          if (comando === '/setname') { if (!args.length) return responder('Uso: /setname Nombre'); await sock.groupUpdateSubject(from, args.join(' ')); responder('✅ Nombre actualizado.\n'+FIRMA); return; }
          if (comando === '/setdesc') { if (!args.length) return responder('Uso: /setdesc Descripción'); await sock.groupUpdateDescription(from, args.join(' ')); responder('✅ Descripción actualizada.\n'+FIRMA); return; }
        }

        // PÚBLICOS
        if (!config.cmd) return;

        if (comando === '/help' || comando === '!help') {
          responder(`╭━━━〔 ⚡ CRISS BOT ⚡ 〕━━━⬣
┃ 👑 Creador: Albert Oficial
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 📋 COMANDOS PÚBLICOS 〕━━⬣
┃ /help — Este menú
┃ /ping — Estado del bot
┃ /info — Info del bot
┃ /hora — Hora actual
┃ /dado — Lanza un dado
┃ /moneda — Cara o sello
┃ /chiste — Chiste random
┃ /frase — Frase motivacional
┃ /creador — Info del creador
┃ /enamorado — Nivel amor
┃ /gay — Nivel gay
┃ /estupido — Nivel estupidez
┃ /suerte — Tu suerte hoy
┃ /calcula — Calculadora
┃ /uptime — Tiempo activo
┃ /ia <texto> — Genera imagen IA
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 👑 ADMIN 〕━━⬣
┃ /kick /add /promote /demote
┃ /ban /mute /unmute /tagall
┃ /warn /antilink /welcome
┃ /bye /linkgrupo /admins
┃ /setname /setdesc
╰━━━━━━━━━━━━━━━━━━⬣

⚡ CRISS BOT BY ALBERT OFICIAL ⚡`);
          return;
        }

        if (comando === '/ping') { responder('🏓 Pong! CRISS BOT activo ✅\n' + FIRMA); return; }
        if (comando === '/info') { responder('ℹ️ *CRISS BOT*\n👑 Albert Oficial\n⚙️ Baileys\n📅 v3.0.0\n🇵🇪 Perú\n' + FIRMA); return; }
        if (comando === '/hora') { responder('🕐 ' + new Date().toLocaleString('es-PE',{timeZone:'America/Lima'}) + '\n' + FIRMA); return; }
        if (comando === '/uptime') { const s=Math.floor((Date.now()-startTime)/1000); responder('⏱️ '+Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m '+(s%60)+'s\n'+FIRMA); return; }
        if (comando === '/dado') { const r=Math.floor(Math.random()*6)+1; responder('🎲 '+['','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣'][r]+'\n'+FIRMA); return; }
        if (comando === '/moneda') { responder('🪙 '+(Math.random()<.5?'*CARA*':'*SELLO*')+'\n'+FIRMA); return; }
        if (comando === '/chiste') { responder('😂 '+chistes[Math.floor(Math.random()*chistes.length)]+'\n'+FIRMA); return; }
        if (comando === '/frase') { const f=['El exito es la suma de pequeños esfuerzos.','No te detengas.','Cree en ti mismo.','Cada dia es nueva oportunidad.','Tu unico limite eres tu mismo.']; responder('💪 '+f[Math.floor(Math.random()*f.length)]+'\n'+FIRMA); return; }
        if (comando === '/creador') { responder('👑 *Albert Oficial*\n📞 +51 996 399 291\n🌎 Perú 🇵🇪\n💻 Bots, apps y web\n🐧 Linux\n\n"La programacion es crear algo unico desde cero."\n'+FIRMA); return; }
        if (comando === '/enamorado') { const n=Math.floor(Math.random()*101); responder('💕 *Nivel Enamorado*\n\n'+'❤️'.repeat(Math.floor(n/10))+'🖤'.repeat(10-Math.floor(n/10))+'\n📊 '+n+'%\n\n'+(n<20?'Eres de piedra 🗿':n<50?'Algo de sentimientos 🤏':n<80?'Enamoradito 🥰':'¡Perdidamente enamorado! 💘')+'\n'+FIRMA); return; }
        if (comando === '/gay') { const n=Math.floor(Math.random()*101); responder('🌈 *Nivel Gay*\n\n'+'🌈'.repeat(Math.floor(n/10))+'⬜'.repeat(10-Math.floor(n/10))+'\n📊 '+n+'%\n\n'+(n<20?'Bien machito 💪':n<50?'Solo curioso 👀':n<80?'Ya casi 🌈':'Full arcoiris! 🏳️‍🌈')+'\n'+FIRMA); return; }
        if (comando === '/estupido') { const n=Math.floor(Math.random()*101); responder('🧠 *Nivel Estupidez*\n\n'+'🧠'.repeat(Math.floor(n/10))+'💀'.repeat(10-Math.floor(n/10))+'\n📊 '+n+'%\n\n'+(n<20?'Inteligente 😏':n<50?'Algo tonto 😅':n<80?'Ya preocupa 😬':'Nivel critico! 💀')+'\n'+FIRMA); return; }
        if (comando === '/suerte') { const n=Math.floor(Math.random()*101); responder('🍀 *Tu suerte hoy*\n\n'+'🍀'.repeat(Math.floor(n/10))+'💀'.repeat(10-Math.floor(n/10))+'\n📊 '+n+'%\n\n'+(n<20?'Quedate en casa 🏠':n<50?'Dia normal 😐':n<80?'Bastante suerte! 🍀':'Juega la loteria! 🎰')+'\n'+FIRMA); return; }
        if (comando === '/calcula') {
          if (args.length<3) return responder('Uso: /calcula 10 + 5');
          const a=parseFloat(args[0]),op=args[1],b=parseFloat(args[2]);
          if (isNaN(a)||isNaN(b)) return responder('Numeros invalidos.');
          let r; if(op==='+')r=a+b; else if(op==='-')r=a-b; else if(op==='*')r=a*b; else if(op==='/')r=b!==0?a/b:'No dividas entre 0'; else return responder('Usa: + - * /');
          responder('🧮 '+a+' '+op+' '+b+' = *'+r+'*\n'+FIRMA); return;
        }

        // IA GENERAR IMAGEN
        if (comando === '/ia' || comando === '!ia') {
          if (!args.length) return responder('Uso: /ia <descripción>\nEjemplo: /ia un gato astronauta');
          responder('🎨 Generando imagen con IA...\nEspera unos segundos ⏳');
          try {
            const imgBuffer = await generarImagen(args.join(' '));
            await sock.sendMessage(from, { image: imgBuffer, caption: '🎨 *Imagen generada por IA*\n📝 Prompt: ' + args.join(' ') + '\n' + FIRMA }, { quoted: msg });
          } catch(e) {
            responder('❌ Error generando imagen. El modelo puede estar cargando, intenta en 30 segundos.\n' + FIRMA);
          }
          return;
        }

        // Anti-link
        if (config.antilink && isGroup) {
          const tieneLink = body.includes('https://')||body.includes('http://')||body.includes('wa.me')||body.includes('chat.whatsapp.com');
          if (tieneLink && !esAdminOOwner) {
            try { await sock.sendMessage(from, { delete: msg.key }); } catch(e) {}
            responder('🔗 Links no permitidos. @'+senderNumber+'\n'+FIRMA);
            return;
          }
        }

        // Respuestas automáticas
        if (bodyLower.includes('hola')||bodyLower.includes('buenas')||bodyLower.includes('alo')) { responder('👋 Hola! Soy *CRISS BOT*. Escribe */help*\n'+FIRMA); return; }
        if (bodyLower.includes('gracias')) { responder('🙏 De nada! — Albert Oficial\n'+FIRMA); return; }
        if (bodyLower.includes('quien eres')||bodyLower.includes('que eres')) { responder('⚡ Soy *CRISS BOT* creado por *Albert Oficial*\n'+FIRMA); return; }
        if (bodyLower.includes('como estas')||bodyLower.includes('como estás')) { responder('🤖 Al 100% operativo!\n'+FIRMA); return; }
        if (bodyLower.includes('te quiero')||bodyLower.includes('te amo')) { responder('❤️ Yo tambien! Pero soy un bot jaja\n'+FIRMA); return; }
        if (bodyLower.includes('aburrido')||bodyLower.includes('aburrida')) { responder('😂 Escribe */chiste* o */dado*\n'+FIRMA); return; }

      } catch(e) { console.log('Error mensaje:', e.message); }
    });

  } catch(e) {
    console.log('Error inicio:', e.message);
    reconectando = false;
    setTimeout(() => startBot(), 5000);
  }
}

iniciarServidor();
startBot();

