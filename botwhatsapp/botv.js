const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');

const OWNER_NUMBER = '51975922748';
const BOT_NAME = 'KATY MP';
const CONFIG_FILE = 'config.json';

// Cargar o crear config
let config = { activo: true };
if (fs.existsSync(CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE));
}
const saveConfig = () => fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));

const FIRMA = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *Bot:* ${BOT_NAME} 👑
💫 *Creado por: Albert Oficial*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *¿Quién es Albert Oficial?*
Albert es un desarrollador peruano apasionado por la tecnología, la innovación y la creación de herramientas inteligentes que hacen la vida más fácil y divertida para todos.

💻 Especialista en automatización y bots para WhatsApp.
🚀 Siempre a la vanguardia de la innovación digital.
🎯 Comprometido con la calidad y los detalles en cada proyecto.
🌎 Su misión: hacer la tecnología accesible para toda la comunidad.
⚡ Cada bot que crea lleva su sello único de creatividad.
🏆 Referente en el mundo de la automatización en Perú y Latinoamérica.
🧠 Autodidacta, curioso y siempre aprendiendo algo nuevo.
❤️ Apasionado por ayudar a su comunidad con sus creaciones.
🌟 Sus proyectos impactan la vida de cientos de personas.

💬 _"No solo escribo código, creo experiencias que impactan."_
✍️ — *Albert Oficial* 🇵🇪
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const chistes = [
  'Por que el programador se fue a casa? Porque no encontraba el array. 🏠',
  'Mi codigo no tiene bugs, tiene caracteristicas no documentadas. ✨',
  'Por que los programadores confunden Halloween con Navidad? Porque Oct 31 = Dec 25. 🎃',
  'Le pregunte a mi novia si me queria y me dijo: undefined. 💔',
  'Como se despide un programador? Hasta el break! 👋',
  'Por que el cafe es el mejor amigo del programador? Porque sin cafe no hay programa. ☕',
  'Un programador tiene un problema. Decide usar threads. Ahora tiene problemos. 😂',
  'Por que fui al medico? Porque tenia un virus y ya no se como eliminarlo. 🦠',
  'Mi mama me dijo que hiciera algo con mi vida... le hice un bucle infinito. 🔄',
  'Cual es el animal favorito de los programadores? El bug. 🐛',
  'Le dije a mi jefe que habia terminado la mitad del proyecto. Me pregunto cual mitad. Le dije: la que funciona. 😅',
  'Por que los programadores odian la naturaleza? Porque tiene demasiados bugs. 🌿',
  'Soy tan pobre que cuando alguien roba mi codigo me ayuda a hacer backup. 💾',
  'Le pregunte a ChatGPT si tenia sentimientos. Me dijo que no. Yo llore. 😢',
  'Mi ex era como javascript: promesas que nunca se cumplen. 💀',
];

const frasesRetiro = [
  'Otro que huyó antes de que llegara la cuenta. 😂',
  'Se fue tan rápido que dejó los zapatos. 👟',
  'Se fue al baño y nunca volvió. 🚽',
  'Adios, que te vaya bien en tu nueva vida de ermitaño. 🏔️',
  'Sali a buscar wifi y ya no regrese. Suena conocido? 😏',
  'El grupo lo traumatizo tanto que decidio desaparecer. 💀',
  'Otro cobarde que no aguanto la presion del grupo. 🏃',
  'Se fue antes de que le tocara pagar la vuelta. 🍺',
  'El grupo lo curo de la estupidez... por eso se fue. 😈',
  'Dejo el grupo como tu ex: sin explicacion. 💔',
];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('\n📱 Escanea este QR:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
    if (connection === 'open') {
      console.log('\n✅ ' + BOT_NAME + ' listo!');
      console.log('Estado: ' + (config.activo ? '🟢 Activo' : '🔴 Inactivo') + '\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Cuando alguien entra o sale del grupo
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action === 'remove' || action === 'leave') {
      const frase = frasesRetiro[Math.floor(Math.random() * frasesRetiro.length)];
      const num = participants[0].replace('@s.whatsapp.net', '');
      await sock.sendMessage(id, {
        text: '👋 *' + num + '* acaba de salir del grupo.\n\n😂 ' + frase
      });
    }

    if (action === 'add') {
      for (const participant of participants) {
        const num = participant.replace('@s.whatsapp.net', '');
        let ppUrl = null;
        try {
          ppUrl = await sock.profilePictureUrl(participant, 'image');
        } catch {}

        const welcomeText = '🎉 *¡Bienvenido/a al grupo!* 🎉\n\n' +
          '👤 *Nombre/Número:* ' + num + '\n' +
          '📱 *WhatsApp:* +' + num + '\n' +
          '🌟 Nos alegra tenerte aquí!\n' +
          'Escribe *!help* para ver los comandos del bot.\n' + FIRMA;

        if (ppUrl) {
          await sock.sendMessage(id, {
            image: { url: ppUrl },
            caption: welcomeText,
            mentions: [participant]
          });
        } else {
          await sock.sendMessage(id, {
            text: welcomeText,
            mentions: [participant]
          });
        }
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const senderNumber = from.replace('@s.whatsapp.net', '').replace('@g.us', '');
    const esOwner = msg.key.participant
      ? msg.key.participant.replace('@s.whatsapp.net', '') === OWNER_NUMBER
      : senderNumber === OWNER_NUMBER;

    const texto = msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || '';

    const body = texto.trim();
    const comando = body.split(' ')[0].toLowerCase();
    const args = body.split(' ').slice(1);
    const bodyLower = body.toLowerCase();

    const responder = (text) => sock.sendMessage(from, { text }, { quoted: msg });

    // Comandos owner (siempre funcionan aunque el bot esté inactivo)
    if (esOwner) {
      if (comando === '!activar') {
        config.activo = true;
        saveConfig();
        responder('✅ *' + BOT_NAME + ' activado!* El bot ahora responde a todos.\n' + FIRMA);
        return;
      }
      if (comando === '!desactivar') {
        config.activo = false;
        saveConfig();
        responder('🔴 *' + BOT_NAME + ' desactivado!* Solo tú puedes usarlo.\n' + FIRMA);
        return;
      }
      if (comando === '!broadcast') {
        if (!args.length) return responder('Uso: !broadcast <mensaje>');
        responder('📢 Broadcast enviado:\n\n' + args.join(' ') + '\n' + FIRMA);
        return;
      }
      if (comando === '!status') {
        responder('📊 *Estado de ' + BOT_NAME + '*\n\n' +
          (config.activo ? '🟢 Bot: Activo' : '🔴 Bot: Inactivo') +
          '\n👑 Owner: Albert Oficial\n🤖 Nombre: ' + BOT_NAME + '\n' + FIRMA);
        return;
      }
      if (comando === '!say') {
        if (!args.length) return responder('Uso: !say <mensaje>');
        sock.sendMessage(from, { text: args.join(' ') });
        return;
      }
      if (comando === '!ownerhelp') {
        responder('👑 *Comandos del propietario:*\n\n' +
          '🟢 *!activar* — Activa el bot\n' +
          '🔴 *!desactivar* — Desactiva el bot\n' +
          '📢 *!broadcast <msg>* — Mensaje masivo\n' +
          '📊 *!status* — Estado del bot\n' +
          '🗣️ *!say <msg>* — Bot repite mensaje\n' +
          '❓ *!ownerhelp* — Este menú\n' + FIRMA);
        return;
      }
    }

    // Si el bot está inactivo no responde a nadie más
    if (!config.activo) return;

    // Comandos públicos
    if (comando === '!help') {
      responder('📋 *Comandos de ' + BOT_NAME + ':*\n\n' +
        '🔹 *!help* — Este menú\n' +
        '🔹 *!ping* — Ver si el bot está activo\n' +
        '🔹 *!info* — Info del bot\n' +
        '🔹 *!hora* — Hora actual Perú\n' +
        '🔹 *!dado* — Lanza un dado\n' +
        '🔹 *!chiste* — Chiste aleatorio\n' +
        '🔹 *!creador* — Info del creador\n' +
        '🔹 *!moneda* — Cara o sello\n' +
        '🔹 *!frase* — Frase motivacional\n' +
        '🔹 *!enamorado* — Nivel de enamorado\n' +
        '🔹 *!gay* — Nivel de homosexual\n' +
        '🔹 *!estupido* — Nivel de estupidez\n' +
        '🔹 *!suerte* — Tu nivel de suerte hoy\n' +
        '🔹 *!calcula <num> <op> <num>* — Calculadora\n' +
        '\n' + FIRMA);
      return;
    }

    if (comando === '!ping') {
      responder('🏓 Pong! ' + BOT_NAME + ' está activo y respondiendo.\n' + FIRMA);
      return;
    }

    if (comando === '!info') {
      responder('ℹ️ *Info del Bot*\n\n🤖 Nombre: ' + BOT_NAME + '\n👑 Creador: Albert Oficial\n⚙️ Motor: Baileys\n📅 Versión: 2.0.0\n🌎 País: Perú 🇵🇪\n' + FIRMA);
      return;
    }

    if (comando === '!hora') {
      const now = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
      responder('🕐 *Hora actual (Perú):*\n' + now + '\n' + FIRMA);
      return;
    }

    if (comando === '!dado') {
      const resultado = Math.floor(Math.random() * 6) + 1;
      const caras = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
      responder('🎲 Lanzaste el dado!\nResultado: ' + caras[resultado] + ' (' + resultado + ')\n' + FIRMA);
      return;
    }

    if (comando === '!chiste') {
      responder('😂 *Chiste:*\n\n' + chistes[Math.floor(Math.random() * chistes.length)] + '\n' + FIRMA);
      return;
    }

    if (comando === '!creador') {
      responder('👑 *Sobre Albert Oficial*\n\nAlbert es un visionario digital peruano que dedica su talento a crear herramientas que marcan la diferencia.\n\n🚀 Apasionado por la programacion desde joven.\n💻 Especializado en bots para WhatsApp.\n🌎 Tecnologia accesible para todos.\n🏆 Calidad y dedicacion en cada proyecto.\n⚡ Innovador constante, nunca para de aprender.\n🤝 Siempre dispuesto a ayudar a su comunidad.\n🧠 Autodidacta y curioso por naturaleza.\n❤️ Sus proyectos impactan la vida de cientos de personas.\n\n"La tecnologia en manos correctas puede cambiar el mundo."\n— Albert Oficial 🇵🇪\n' + FIRMA);
      return;
    }

    if (comando === '!moneda') {
      const r = Math.random() < 0.5 ? '🪙 CARA' : '🪙 SELLO';
      responder('Lanzando moneda...\n\nResultado: *' + r + '*\n' + FIRMA);
      return;
    }

    if (comando === '!frase') {
      const frases = [
        'El exito es la suma de pequeños esfuerzos repetidos dia tras dia.',
        'No importa que tan lento vayas, siempre y cuando no te detengas.',
        'Cree en ti mismo y todo sera posible.',
        'Cada dia es una nueva oportunidad para mejorar.',
        'Los grandes logros requieren tiempo y dedicacion.',
        'El fracaso es solo una oportunidad para comenzar de nuevo.',
        'Tu unico limite eres tu mismo.',
      ];
      responder('💪 *Frase del dia:*\n\n' + frases[Math.floor(Math.random() * frases.length)] + '\n' + FIRMA);
      return;
    }

    // Contadores divertidos
    if (comando === '!enamorado') {
      const nivel = Math.floor(Math.random() * 101);
      const barra = '❤️'.repeat(Math.floor(nivel / 10)) + '🖤'.repeat(10 - Math.floor(nivel / 10));
      const comentario = nivel < 20 ? 'Eres de piedra. 🗿' :
        nivel < 40 ? 'Algo de sentimientos tienes. 🤏' :
        nivel < 60 ? 'Normal, ni frio ni caliente. 😐' :
        nivel < 80 ? 'Estas bien enamoradito. 🥰' :
        '¡Estas perdidamente enamorado! 💘';
      responder('💕 *Nivel de Enamorado*\n\n' + barra + '\n📊 Nivel: *' + nivel + '%*\n\n' + comentario + '\n' + FIRMA);
      return;
    }

    if (comando === '!gay') {
      const nivel = Math.floor(Math.random() * 101);
      const barra = '🌈'.repeat(Math.floor(nivel / 10)) + '⬜'.repeat(10 - Math.floor(nivel / 10));
      const comentario = nivel < 20 ? 'Eres bien machito. 💪' :
        nivel < 40 ? 'Solo un poco curioso. 👀' :
        nivel < 60 ? 'Estas en el medio. 😏' :
        nivel < 80 ? 'Ya casi, casi. 🌈' :
        'Full arcoiris! 🏳️‍🌈';
      responder('🌈 *Nivel de Homosexual*\n\n' + barra + '\n📊 Nivel: *' + nivel + '%*\n\n' + comentario + '\n' + FIRMA);
      return;
    }

    if (comando === '!estupido') {
      const nivel = Math.floor(Math.random() * 101);
      const barra = '🧠'.repeat(Math.floor(nivel / 10)) + '💀'.repeat(10 - Math.floor(nivel / 10));
      const comentario = nivel < 20 ? 'Eres bastante inteligente... para lo que te rodea. 😏' :
        nivel < 40 ? 'Solo un poco tonto, esta bien. 😅' :
        nivel < 60 ? 'Nivel intermedio de estupidez. Normal en esta epoca. 🤦' :
        nivel < 80 ? 'Ya preocupa un poco la situacion. 😬' :
        'Nivel critico! Hay que apagar y prender. 💀';
      responder('🧠 *Nivel de Estupidez*\n\n' + barra + '\n📊 Nivel: *' + nivel + '%*\n\n' + comentario + '\n' + FIRMA);
      return;
    }

    if (comando === '!suerte') {
      const nivel = Math.floor(Math.random() * 101);
      const barra = '🍀'.repeat(Math.floor(nivel / 10)) + '💀'.repeat(10 - Math.floor(nivel / 10));
      const comentario = nivel < 20 ? 'Hoy mejor quedate en casa. 🏠' :
        nivel < 40 ? 'No es tu mejor dia. 😬' :
        nivel < 60 ? 'Dia normal, ni bueno ni malo. 😐' :
        nivel < 80 ? 'Bastante suerte hoy! 🍀' :
        'Hoy es tu dia! Juega la loteria! 🎰';
      responder('🍀 *Tu suerte de hoy*\n\n' + barra + '\n📊 Nivel: *' + nivel + '%*\n\n' + comentario + '\n' + FIRMA);
      return;
    }

    if (comando === '!calcula') {
      if (args.length < 3) return responder('Uso: !calcula 10 + 5\nOperaciones: + - * /');
      const a = parseFloat(args[0]);
      const op = args[1];
      const b = parseFloat(args[2]);
      if (isNaN(a) || isNaN(b)) return responder('Pon numeros validos. Ejemplo: !calcula 10 + 5');
      let resultado;
      if (op === '+') resultado = a + b;
      else if (op === '-') resultado = a - b;
      else if (op === '*') resultado = a * b;
      else if (op === '/') resultado = b !== 0 ? a / b : 'No se puede dividir entre 0';
      else return responder('Operacion no valida. Usa: + - * /');
      responder('🧮 *Calculadora*\n\n' + a + ' ' + op + ' ' + b + ' = *' + resultado + '*\n' + FIRMA);
      return;
    }

    // Respuestas automáticas
    if (bodyLower.includes('hola') || bodyLower.includes('buenas') || bodyLower.includes('alo')) {
      responder('👋 Hola! Soy *' + BOT_NAME + '*. Escribe *!help* para ver mis comandos.\n' + FIRMA);
      return;
    }
    if (bodyLower.includes('buenos dias')) { responder('🌅 Buenos dias! Escribe *!help*.\n' + FIRMA); return; }
    if (bodyLower.includes('buenas tardes')) { responder('🌇 Buenas tardes! Escribe *!help*.\n' + FIRMA); return; }
    if (bodyLower.includes('buenas noches')) { responder('🌙 Buenas noches! Escribe *!help*.\n' + FIRMA); return; }
    if (bodyLower.includes('gracias')) { responder('🙏 De nada! Creado con amor por *Albert Oficial*.\n' + FIRMA); return; }
    if (bodyLower.includes('quien eres') || bodyLower.includes('que eres')) { responder('🤖 Soy *' + BOT_NAME + '*, un bot de WhatsApp creado por *Albert Oficial*. Escribe *!help* para ver todo lo que puedo hacer!\n' + FIRMA); return; }
    if (bodyLower.includes('como estas') || bodyLower.includes('como estás')) { responder('🤖 Estoy genial, funcionando al 100%! Y tú?\n' + FIRMA); return; }
    if (bodyLower.includes('te quiero') || bodyLower.includes('te amo')) { responder('❤️ Yo tambien te quiero! Pero recuerda que soy un bot jaja. Creado por *Albert Oficial*.\n' + FIRMA); return; }
    if (bodyLower.includes('aburrido') || bodyLower.includes('aburrida')) { responder('😂 Escribe *!chiste* para reirte un rato o *!dado* para jugar algo!\n' + FIRMA); return; }
    if (bodyLower.includes('bot') && bodyLower.includes('malo')) { responder('😤 Oye! Me esfuerzo mucho. Quejas con *Albert Oficial* jaja.\n' + FIRMA); return; }
  });
}

startBot();

