import pino from "pino";
import qrcode from "qrcode-terminal";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

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
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("📱 SCAN QR CODE WITH WHATSAPP:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ MagebaBot CONNECTED!");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Connection closed:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Restarting...");
        setTimeout(startBot, 5000);
      }
    }
  });
}

startBot();
