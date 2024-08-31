"use client";

import { io } from "socket.io-client";

export const socket = (domain: string) =>
	io(
		(process.env.NODE_ENV == "development" ? "http://" : "https://") + domain,
		{
			reconnection: true,
			reconnectionDelay: 1000,
		}
	);
