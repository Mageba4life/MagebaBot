import crypto from "crypto";
globalThis.crypto = crypto.webcrypto;
import pkg from "@whiskeysockets/baileys";
import pino from "pino";

const { default: makeWASocket, useMultiFileAuthState } = pkg;

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  if (!sock.authState?.creds?.registered) {
    const phoneNumber = "27792530518"; // put your number here
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("PAIRING CODE:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {

    if (connection === "open") {
      console.log("✅ MagebaBot connected!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");
      startBot();
    }

  });
}

startBot();
