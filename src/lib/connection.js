import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import readline from "readline";
import P from "pino";
import chalk from "chalk";

let sock;

const conn = async () => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("state");
  const useCode = process.argv.includes("--use-code");
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n" + chalk.blue("📡  Connecting to WhatsApp..."));

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "fatal" })),
    },
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    printQRInTerminal: !useCode,
    logger: P({ level: "fatal" }),
    version,
    defaultQueryTimeoutMs: 0,
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  if (useCode && !sock.authState.creds.registered) {
    setTimeout(async () => {
      input.question(
        `${"\nMasukkan nomor telepon (62xxxxxxxx)"}\n${"Nomor"}: `,
        async function (phoneNumber) {
          await sock.waitForConnectionUpdate((update) => !!update.qr);
          let code = await sock.requestPairingCode(
            phoneNumber.replace(/\D/g, "")
          );
          console.log(`\n${"Code"} : ${code.match(/.{1,4}/g)?.join("-")}\n`);
          input.close();
        }
      );
    }, 3000);
  }
  sock.ev.on("connection.update", (m) => {
    const { connection, lastDisconnect } = m;
    if (connection == "close") {
      console.log(lastDisconnect);
      conn();
    }
    if (connection == "open") {
      const waConnectionStatus = `
${chalk.bold.green(`Using WA ${version.join(".")}`)} ${chalk.cyan(
        `isLatest: ${isLatest}`
      )}
${chalk.bold.green("Connected at")} ${chalk.magenta(sock.user?.id)}

${chalk.bold.green("✅ Connection Successful!")}

${chalk.blue("Enjoy your bot!")}
`;
      console.log(waConnectionStatus);
    }
  });

  sock.ev.on("creds.update", await saveCreds);
};

export { conn, sock };
