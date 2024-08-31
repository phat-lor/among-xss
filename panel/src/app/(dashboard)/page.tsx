"use client";
import DashNavbar from "@/components/Navbar";
import ClientCard from "@/components/dashbord/ClientCard";
import { socket } from "@/lib/socket";
import { niggafyAuth } from "@/lib/util";
import { AuthInfo, Client, Clients } from "@/types";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Image,
	Spinner,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { EarthIcon, SearchCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PanelPage() {
	const router = useRouter();
	const [authInfo, setAuthInfo] = useState<AuthInfo>({
		domain: "",
		key: "",
		isSus: false,
		fails: 0,
	});
	const [loaded, setLoaded] = useState(false);
	const [data, setData] = useState<Clients | null>(null);
	const [socketIn, setSocket] = useState<any>(null);

	useEffect(() => {
		const storedAuthInfo = localStorage.getItem("authInfo");
		if (storedAuthInfo) {
			setAuthInfo(JSON.parse(niggafyAuth(storedAuthInfo, true)));
		}
		setLoaded(true);
	}, []);

	useEffect(() => {
		if (!loaded) return;

		if (authInfo.domain === "" || authInfo.key === "") {
			router.push("/auth");
			toast.error("Unauthorized", {
				description:
					"You need to provide a domain and key to access the dashboard.",
			});
		}

		const socketInstance = socket(authInfo.domain);
		setSocket(socketInstance);

		const handleAuthResponse = (data: string) => {
			if (data === "success") {
				socketInstance.emit("s_getdata");
			} else {
				setAuthInfo((prevState) => ({
					...prevState,
					fails: prevState.fails + 1,
				}));
				router.push("/auth");
				toast.error("Unauthorized", {
					description: "The key you provided is invalid.",
				});
			}
		};

		const handleDataResponse = (data: Clients) => {
			setData(data);
		};

		const handleReconnectAttempt = () => {
			toast.warning("Reconnecting", {
				description: `Attempting to reconnect to the server.`,
			});
		};

		const handleReconnect = () => {
			toast.success("Reconnected", {
				description: "You are now reconnected to the server.",
			});
		};

		const handleDisconnect = () => {
			toast.error("Disconnected", {
				description: "You have been disconnected from the server.",
			});
			// socketInstance.close();
		};

		const handleConnectionError = () => {
			router.push("/auth");
			toast.error("Connection Error", {
				description: "Unable to connect to the server.",
			});
		};

		const initSocket = () => {
			socketInstance.on("connect", () => {
				socketInstance.emit("auth", authInfo.key);
				socketInstance.on("auth", handleAuthResponse);
				socketInstance.on("c_getdata", handleDataResponse);
			});

			socketInstance.on("connect_error", handleConnectionError);
			socketInstance.on("disconnect", handleDisconnect);
			socketInstance.io.on("reconnect_attempt", handleReconnectAttempt);
			socketInstance.io.on("reconnect", handleReconnect);
		};

		try {
			initSocket();
		} catch (error) {
			console.error(error);
		}

		return () => {
			socketInstance.off("connect", initSocket);
			socketInstance.off("auth", handleAuthResponse);
			socketInstance.off("c_getdata", handleDataResponse);
			socketInstance.off("disconnect", handleDisconnect);
			socketInstance.off("connect_error", handleConnectionError);
			socketInstance.off("reconnect_attempt", handleReconnectAttempt);
			socketInstance.off("reconnect", handleReconnect);
			socketInstance.close();
		};
	}, [authInfo.domain, authInfo.key, loaded, router]);

	const [selected, setSelected] = useState<string>("");

	return (
		<main className="flex flex-col min-h-screen w-full">
			<DashNavbar data={data} authInfo={authInfo} />
			{/* adaptable grid */}
			<div className="w-full  min-h-[calc(100vh-85px)] p-4 gap-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{data ? (
					Object.entries(data).map(([key, value]: [string, Client]) => {
						return (
							<ClientCard key={key} cat={key} value={value} socket={socketIn} />
						);
					})
				) : (
					<div className="flex items-center justify-center w-full h-full col-span-3">
						<Spinner />
					</div>
				)}
			</div>
		</main>
	);
}
