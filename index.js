import pino from "pino";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

console.log("🚀 MagebaBot is starting...");

const PHONE_NUMBER = "27792530518";

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // Request pairing code ONLY ONCE
  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log("🔑 WHATSAPP PAIRING CODE:", code);
      } catch (err) {
        console.log("❌ Pairing error:", err.message);
      }
    }, 3000);
  }

  sock.ev.on("connection.update", (update) => {

    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {

      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Connection closed:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Restarting in 10 seconds...");
        setTimeout(startBot, 10000);
      }
    }

  });
}

startBot().catch(err => {
  console.log("❌ Fatal:", err);
});
