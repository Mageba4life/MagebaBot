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
    browser: ["MagebaBot", "Chrome", "1.0.0"],
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {

    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("SCAN THIS QR CODE:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot connected successfully!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");

      console.log(
        "Reason:",
        lastDisconnect?.error?.message || "Unknown reason"
      );
    }

  });

}

startBot();
