import pino from "pino";
import makeWASocket, {
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

console.log("🚀 MagebaBot is starting...");

const phoneNumber = "27792530518";

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

    if (connection === "connecting") {
      console.log("🔄 Connecting...");
      
      if (!sock.authState?.creds?.registered) {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("🔑 YOUR WHATSAPP PAIRING CODE:", code);
      }
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {
      console.log("❌ Connection closed");
    }

  });

}

startBot();
