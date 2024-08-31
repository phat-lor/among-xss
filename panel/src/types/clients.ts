// example
// [
// {
//     "M3X79fMDT7HT_XltAABh": {
//         "cookie": "",
//         "localStorage": {},
//         "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
//         "origin": "file://",
//         "href": "file:///c%3A/Users/phatl/OneDrive/Documents/work/nut/amongpanel/socket-host/index.html",
//         "image": ""

//     },
//     "GoRa8tGPcADEakxoAABj": {
//         "cookie": "",
//         "localStorage": {},
//         "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
//         "origin": "file://",
//         "href": "file:///c%3A/Users/phatl/OneDrive/Documents/work/nut/amongpanel/socket-host/index.html",
//         "image": ""
//     }
// }
// ]
interface Client {
	cookie: string;
	localStorage: object;
	agent: string;
	origin: string;
	href: string;
	image: string;
}

interface Clients {
	[key: string]: Client;
}

export type { Client, Clients };
