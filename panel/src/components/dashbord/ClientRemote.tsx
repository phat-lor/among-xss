import { niggafyAuth } from "@/lib/util";
import { AuthInfo, Client } from "@/types";
import { Editor } from "@monaco-editor/react";
import {
	Card,
	Image,
	CardHeader,
	CardBody,
	Tooltip,
	Modal,
	Button,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Skeleton,
} from "@nextui-org/react";
import {
	ArchiveIcon,
	CodeIcon,
	CookieIcon,
	EarthIcon,
	ExternalLinkIcon,
	PlayIcon,
	ScreenShareIcon,
	TerminalIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

const defaultCode = `//code here\nconst res = await fetch("https://wtfismyip.com/json");\nconst data = await res.json();\nreturn JSON.stringify(data);`;

function ClientRemote({
	cat,
	value,
	isOpen,
	onOpenChange,
	socket,
}: {
	cat: string;
	value: Client;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	socket: Socket;
}) {
	const router = useRouter();
	const [authInfo, setAuthInfo] = useState<AuthInfo>({
		domain: "",
		key: "",
		isSus: false,
		fails: 0,
	});

	useEffect(() => {
		const storedAuthInfo = localStorage.getItem("authInfo");
		if (storedAuthInfo) {
			setAuthInfo(JSON.parse(niggafyAuth(storedAuthInfo, true)));
		}
	}, []);
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex gap-2">
							<ScreenShareIcon />
							Remote {cat}
						</ModalHeader>
						<ModalBody className="flex flex-col gap-2">
							<iframe
								src={`${
									process.env.NODE_ENV === "development" ? "http" : "https"
								}://${authInfo.domain}/remote/${cat}/`}
								width="100%"
								height="100%"
								className="h-[60vh] w-full border-0"
								title="Iframe Example"
							></iframe>
						</ModalBody>
						<ModalFooter>
							<Button onClick={onClose} startContent={<ArchiveIcon />}>
								Close
							</Button>
							{/* open in new tab */}
							<Button
								onClick={() =>
									window.open(
										`${
											process.env.NODE_ENV === "development" ? "http" : "https"
										}://${authInfo.domain}/remote/${cat}/`
									)
								}
								startContent={<ExternalLinkIcon />}
								color="primary"
							>
								Open in new tab
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}

export default ClientRemote;
