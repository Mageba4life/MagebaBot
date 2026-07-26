import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;

import pkg from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const { default: makeWASocket, useMultiFileAuthState } = pkg;

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {

    const { connection, qr } = update;

    if (qr) {
      console.log("Scan this QR code:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot connected successfully!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");
    }

  });
}

startBot();
