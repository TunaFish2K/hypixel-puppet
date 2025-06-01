import { Bot, createBot } from "mineflayer";
import { ChatMessage } from "prismarine-chat";
import express from "express";
import { COMMAND_MESSAGE } from "./regex";

const PREFIX = "\u2741";

const CHR = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function createMessageID() {
    let result = [];
    for (let i = 0; i < 8; i++) {
        result.push(CHR[Math.floor(Math.random() * CHR.length)]);
    }
    return `[${result.join("")}]`;
}

const SUPPORTED_COMMANDS: {
    command: string;
    env: string;
    default?: boolean;
}[] = [
    {
        command: "boop",
        env: "GUILD_BOOP",
    },
    {
        command: "ciallo",
        env: "GUILD_CIALLO",
    },
    {
        command: "cf",
        env: "GUILD_FLIP"
    },
    {
        command: "dice",
        env: "GUILD_DICE"
    },
    {
        command: "8ball",
        env: "GUILD_8BALL"
    },
    {
        command: "help",
        env: "GUILD_HELP",
        default: true,
    },
];

const EIGHT_BALL_MESSAGES = [
    "嗯嗯",
    "不太行",
    "对的对的",
    "不对不对",
    "不知道捏",
    "再问一遍嘿嘿",
    "不告诉你喵",
];

class Puppet {
    firstLoggedIn = true;

    bot?: Bot;
    reconnecting: boolean = false;

    host: string;
    port: number;
    username: string;
    server?: Server;

    options: {
        enabledCommands: string[];
    } = {
        enabledCommands: [],
    };

    constructor(
        host: string,
        port: number,
        username: string,
        options?: Partial<typeof this.options>,
    ) {
        this.host = host;
        this.port = port;
        this.username = username;

        for (const key in options ?? {}) {
            // @ts-ignore
            this.options[key] = options[key];
        }
    }

    createBot() {
        return createBot({
            host: this.host,
            port: this.port,
            auth: "microsoft",
            username: this.username,
            version: "1.8.9",
        });
    }

    joinLimbo() {
        console.log("joining limbo...");
        for (let i = 0; i < 20; i++) {
            this.bot!.chat("/");
        }
        this.firstLoggedIn = false;
    }

    reconnect() {
        if (this.reconnecting) {
            console.error("reconnecting failed, give up");
            return;
        }
        this.reconnecting = true;
        console.log(`connecting to ${this.host}:${this.port}...`);
        this.bot = this.createBot();
        this.bot.on("kicked", this.onKick.bind(this));
        this.bot.on("end", this.onEnd.bind(this));
        this.bot.on("error", this.onError.bind(this));
        this.bot.on("spawn", this.onLogin.bind(this));

        this.bot.on("message", this.onMessage.bind(this));
    }

    onKick(reason: string, loggedIn: boolean) {
        console.log(`Kicked for: ${reason}`);
        this.reconnect();
    }

    onEnd(reason: string) {
        console.log(`End for: ${reason}`);
        this.reconnect();
    }

    onError(error: Error) {
        console.log(`Error: ${error}`);
        this.reconnect();
    }

    onLogin() {
        this.reconnecting = false;
        console.log("Logged in.");
        this.firstLoggedIn && this.joinLimbo();
    }

    onMessage(message: ChatMessage) {
        console.log("received:", message.toString());
        this.server!.pushMessage(message.toMotd());

        const commandMatch = message.toString().match(COMMAND_MESSAGE);
        if (commandMatch && commandMatch[5]) {
            console.log(commandMatch.map((v, i) => `${i}: ${v}`).join("\n"));
            this.handleGuildCommand(
                commandMatch[5],
                commandMatch[6] !== undefined ? commandMatch[6].trim().split(" ").filter(v => v !== "") : [],
            );
        }
    }

    isCommandSupported(command: string) {
        return this.options.enabledCommands.indexOf(command) !== -1;
    }

    createCialloMessage() {
        if (Math.random() <= 0.999) {
            return "Ciallo～(∠・ω<)⌒★";
        }
        return "Ciallo～ᕕ(◠ڼ◠)ᕗ";
    }

    handleGuildCommand(command: string, arg: string[]) {
        if (!this.isCommandSupported(command)) return;

        if (command === "boop" && arg[0]) {
            return this.sendMessage(`/boop ${arg[0]}`);
        }

        if (command === "ciallo") {
            return this.sendMessage(`/gc ${PREFIX} ${this.createCialloMessage()} ${createMessageID()}`);
        }

        if (command === "cf") {
            return this.sendMessage(`/gc ${PREFIX} ${Math.random() > 0.5 ? "head" : "tail"} ${createMessageID()}`);
        }

        if (command === "dice") {
            return this.sendMessage(`/gc ${PREFIX} ${Math.floor(Math.random() * 6) + 1} ${createMessageID()}`);
        }

        if (command === "8ball") {
            return this.sendMessage(`/gc ${PREFIX} ${EIGHT_BALL_MESSAGES[Math.floor(Math.random() * EIGHT_BALL_MESSAGES.length)]} ${createMessageID()}`)
        }

        if (command === "help" && this.options.enabledCommands.length > 0) {
            return this.sendMessage(
                `${PREFIX} Commands: ${this.options.enabledCommands.join(", ")} ${createMessageID()}`,
            );
        }
    }

    messageQueue: string[] = [];

    async sendMessage(message: string) {
        console.log("sending:", message);
        this.bot!.chat(message.toString());
    }

    pushMessageToSend(message: string) {
        this.messageQueue.push(message);
    }

    loop() {
        if (this.messageQueue[0]) {
            this.sendMessage(this.messageQueue.shift()!);
        }
        setTimeout(this.loop.bind(this), 50);
    }
}

class Server {
    host: string;
    port: number;
    callback: string;
    puppet?: Puppet;
    constructor(host: string, port: number, callback: string) {
        this.host = host;
        this.port = port;
        this.callback = callback;
    }

    messageQueue: string[] = [];

    pushMessage(message: string) {
        this.messageQueue.push(message);
    }

    nextSendingTry = 0;

    async loop() {
        const message = this.messageQueue[0];
        if (message && Date.now() >= this.nextSendingTry) {
            const url = new URL(this.callback);
            url.pathname = "/message";
            try {
                await fetch(url, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message,
                        username: this.puppet!.username,
                    }),
                });
                this.messageQueue.shift();
            } catch (e) {
                console.error(e);
                console.error(
                    "failed to send message to callback url, retrying after 10s",
                );
                this.nextSendingTry = Date.now() + 10 * 1000;
            }
        }
        setTimeout(this.loop.bind(this), 50);
    }

    runningServer?: ReturnType<typeof express>;

    startAPI() {
        const server = express();
        server.post("/send", express.json(), (req, res) => {
            console.log(req.body);
            const { message } = req.body as { message: string };
            this.puppet?.pushMessageToSend(message);
            res.end();
        });

        server.get("/name", (req, res) => {
            res.json({
                name: this.puppet!.bot!.username,
            });
        });

        server.listen(this.port, this.host, () => {
            console.log(`Server listening on ${this.host}:${this.port}.`);
        });

        this.runningServer = server;
    }
}

function main() {
    const host = process.env["HYPIXEL_HOST"] ?? "mc.hypixel.net";
    let port;
    if (!process.env["HYPIXEL_PORT"]) port = 25565;
    else {
        port = parseInt(process.env["HYPIXEL_PORT"]);
    }
    if (Number.isNaN(port)) {
        return console.error(
            "environ `HYPIXEL_PORT` must be a valid port number!",
        );
    }

    const username = process.env["MCUSER"];
    if (!username) {
        return console.error("environ `MCUSER` not set!");
    }

    const apiHost = process.env["API_HOST"] || "127.0.0.1";
    const apiPort = process.env["API_PORT"];
    if (!apiPort || Number.isNaN(parseInt(apiPort)))
        return console.error("environ `API_PORT` must be a valid number!");

    const callback = process.env["API_CALLBACK"];
    if (!callback) return console.error("environ `API_CALLBACK` not set!");

    const enabledCommands = SUPPORTED_COMMANDS.filter((v) =>
        process.env[v.env] !== undefined
            ? process.env[v.env] === "true"
            : v.default ?? false,
    ).map((v) => v.command);

    const server = new Server(apiHost, parseInt(apiPort), callback);
    const puppet = new Puppet(host, port, username, {
        enabledCommands: enabledCommands,
    });

    server.puppet = puppet;
    puppet.server = server;

    puppet.reconnect();
    server.startAPI();

    server.loop();
    puppet.loop();
}

main();
