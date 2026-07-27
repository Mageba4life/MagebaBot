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
    browser: ["MagebaBot", "Chrome", "1.0.0"],
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {

    if (qr) {
      console.log("📱 SCAN THIS QR CODE:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Connection closed:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting in 5 seconds...");
        setTimeout(startBot, 5000);
      } else {
        console.log("⚠️ Logged out. Delete the session folder and scan the QR again.");
      }
    }
  });
}

startBot();
