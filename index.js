import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";
import qrcode from "qrcode-terminal";

console.log("🚀 MagebaBot is starting...");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("📱 Scan this QR code:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot Connected!");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("❌ Connection closed:", code);

      if (code !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting in 5 seconds...");
        setTimeout(startBot, 5000);
      } else {
        console.log("⚠️ Logged out. Delete the session folder and scan again.");
      }
    }
  });
}

startBot().catch(console.error);
