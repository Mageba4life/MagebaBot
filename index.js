import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;

import pkg from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const makeWASocket = pkg.default;
const { useMultiFileAuthState, DisconnectReason } = pkg;

console.log("🚀 MagebaBot is starting...");

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {

    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("📱 SCAN THIS QR CODE WITH WHATSAPP:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Connection closed:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Restarting connection...");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("⚠️ Logged out. Delete session and scan QR again.");
      }
    }

  });

}

startBot();
