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
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ MagebaBot connected successfully!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");
    }
  });

  // WhatsApp pairing code
  if (!state.creds.registered) {

    const phoneNumber = "27792530518";

    await new Promise(resolve => setTimeout(resolve, 3000));

    const code = await sock.requestPairingCode(phoneNumber);

    console.log("================================");
    console.log("PAIRING CODE:", code);
    console.log("================================");
  }
}

startBot();
