import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;

import pkg from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const { default: makeWASocket, useMultiFileAuthState } = pkg;

console.log("🚀 MagebaBot is starting...");

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {

    console.log("📡 WhatsApp update received");

    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("📱 SCAN QR CODE:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");

      console.log(
        lastDisconnect?.error?.message || "No reason given"
      );
    }

  });

}

startBot();
