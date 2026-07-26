import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;

import pkg from "@whiskeysockets/baileys";
import pino from "pino";

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

  sock.ev.on("connection.update", async ({ connection }) => {

    if (connection === "open") {
      console.log("✅ MagebaBot connected!");
    }

    if (connection === "close") {
      console.log("⚠️ Connection closed - waiting...");
    }
  });


  if (!state.creds.registered) {

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const code = await sock.requestPairingCode("27792530518");

      console.log("====================");
      console.log("PAIRING CODE:", code);
      console.log("====================");

      console.log("Waiting for WhatsApp linking...");
      
    } catch (err) {
      console.log("Pairing error:", err.message);
    }
  }
}

startBot();
