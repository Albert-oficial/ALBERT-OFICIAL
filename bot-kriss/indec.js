sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
        console.clear();
        console.log("📱 ESCANEA ESTE QR AHORA:\n");
        qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
        console.log("✅ BOT CONECTADO");
    }

    if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;

        // 🔴 SOLO reconectar si NO es logout
        if (code !== 401) {
            console.log("⚠️ Reintentando conexión en 5s...");
            setTimeout(startBot, 5000);
        } else {
            console.log("❌ Sesión cerrada. Debes escanear QR otra vez.");
        }
    }
});
