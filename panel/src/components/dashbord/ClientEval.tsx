import { Client } from "@/types";
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
	PlayIcon,
	ScreenShareIcon,
	TerminalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

const defaultCode = `//code here\nconst res = await fetch("https://wtfismyip.com/json");\nconst data = await res.json();\nreturn JSON.stringify(data);`;

function ClientEval({
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
	const [isLoading, setIsLoading] = useState(false);
	const [code, setCode] = useState<string>(defaultCode);
	const [result, setResult] = useState<any>(null);

	useEffect(() => {
		socket.on("c_result", (status, data) => {
			if (status === "success") {
				setResult(data);
			} else {
				toast.error("Error", {
					description: data,
				});
			}
			setIsLoading(false);
		});
		return () => {
			socket.off("c_result");
		};
	});
	const handleExecuteCode = () => {
		setIsLoading(true);
		setResult(null);
		socket.emit("s_commands", cat, code);
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex gap-2">
							<CodeIcon />
							Evaluate {cat}
						</ModalHeader>
						<ModalBody className="flex flex-col gap-2">
							<div className="flex flex-col gap-1">
								<p className="text-xs text-default-500">Code</p>
								<Editor
									height="30vh"
									defaultLanguage="javascript"
									defaultValue={defaultCode}
									theme="vs-dark"
									onChange={(e) => setCode(e as any)}
									value={code}
								/>
								<Button
									onClick={handleExecuteCode}
									color="primary"
									startContent={<PlayIcon />}
									isLoading={isLoading}
								>
									Execute
								</Button>
							</div>
							<div className="flex flex-col gap-1">
								<p className="text-xs text-default-500">
									Result (Right click and click Format Document to format)
								</p>
								{isLoading ? (
									<>
										<Skeleton className="w-full h-[30vh]" />
									</>
								) : (
									<Editor
										height="30vh"
										defaultLanguage="json"
										defaultValue={JSON.stringify(result, null, 2)}
										theme="vs-dark"
										options={{
											formatOnPaste: true,
											formatOnType: true,
										}}
										// if is json buitify it
										value={result}
									/>
								)}
							</div>
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}

export default ClientEval;
