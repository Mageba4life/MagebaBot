import pkg from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import pino from "pino";

const { default: makeWASocket, useMultiFileAuthState } = pkg;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;

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
