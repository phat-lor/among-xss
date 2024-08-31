import { Client } from "@/types";
import {
	Card,
	Image,
	CardHeader,
	CardBody,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { EarthIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import ClientModal from "./ClientModal";
import { Socket } from "socket.io-client";

function ClientCard({
	cat,
	value,
	socket,
}: {
	cat: string;
	value: Client;
	socket: Socket;
}) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<>
			<Card
				key={cat}
				className="w-full border-default-700 h-[370px]"
				isPressable
				onClick={onOpen}
			>
				<CardHeader>
					<Image src={value.image} alt={value.agent} />
				</CardHeader>
				<CardBody>
					<div className="flex items-start flex-col gap-2">
						<Tooltip content={value.origin} placement="top-start">
							<p className="flex items-center gap-1">
								<EarthIcon size={16} /> {value.origin}
							</p>
						</Tooltip>
						<Tooltip content={value.href} placement="top-start">
							<p className="text-xs text-ellipsis overflow-hidden line-clamp-1 w-[200px]">
								{value.href}
							</p>
						</Tooltip>
						<Tooltip content={value.agent} placement="top-start">
							<p className="text-xs text-ellipsis overflow-hidden text-pretty line-clamp-2 w-[200px]">
								{value.agent}
							</p>
						</Tooltip>
						<p className="text-xs text-default-500">{cat}</p>
					</div>
				</CardBody>
			</Card>
			<ClientModal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				value={value}
				cat={cat}
				socket={socket}
			/>
		</>
	);
}

export default ClientCard;
