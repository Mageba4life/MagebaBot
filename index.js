import pino from "pino";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

console.log("🚀 MagebaBot is starting...");

const PHONE_NUMBER = "27792530518"; // 0792530518 with South Africa code

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["MagebaBot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect } = update;

    if (connection === "connecting") {
      console.log("🔄 Connecting...");
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {

      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Connection closed:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔁 Restarting...");
        setTimeout(startBot, 5000);
      }
    }

    if (!state.creds.registered) {
      try {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const code = await sock.requestPairingCode(PHONE_NUMBER);

        console.log("🔑 YOUR WHATSAPP PAIRING CODE:", code);

      } catch (error) {
        console.log("❌ Pairing code error:", error.message);
      }
    }

  });

}

startBot().catch(err => {
  console.log("❌ Fatal error:", err);
});
