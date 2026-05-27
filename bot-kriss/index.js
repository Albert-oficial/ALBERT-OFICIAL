const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");
const QRCode = require("qrcode");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;

        if (qr) {
            console.log("📷 Generando QR como imagen...");

            await QRCode.toFile("qr.png", qr);

            console.log("✅ QR guardado como 'qr.png'");
            console.log("👉 Ábrelo en tu galería y escanéalo");
        }

        if (connection === "open") {
            console.log("✅ BOT CONECTADO");
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

startBot();
