"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Image, Input } from "@nextui-org/react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import Captcha from "@/components/auth/Captcha";
import { socket } from "@/lib/socket";
import { niggafyAuth } from "@/lib/util";
import { AuthInfo } from "@/types";

function AuthPage() {
	const router = useRouter();
	const [authInfo, setAuthInfo] = useState<AuthInfo>({
		domain: "",
		key: "",
		isSus: false,
		fails: 0,
	});
	const [loaded, setLoaded] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const storedAuthInfo = localStorage.getItem("authInfo");
		if (storedAuthInfo) {
			setAuthInfo(JSON.parse(niggafyAuth(storedAuthInfo, true)));
		}
		setLoaded(true);
	}, []);

	useEffect(() => {
		if (loaded) {
			localStorage.setItem("authInfo", niggafyAuth(JSON.stringify(authInfo)));
		}
	}, [authInfo, loaded]);

	const handleChange = (field: string) => (e: { target: { value: any } }) => {
		setAuthInfo((prevState) => ({ ...prevState, [field]: e.target.value }));
	};

	const activateCaptcha = () => {
		setAuthInfo((prevState) => ({ ...prevState, isSus: true }));
	};

	const handleAuth = () => {
		setLoading(true);
		try {
			const socketInstance = socket(authInfo.domain);

			socketInstance.on("connect", () => {
				socketInstance.emit("auth", authInfo.key);

				socketInstance.on("auth", (data) => {
					if (data === "success") {
						setAuthInfo((prevState) => ({ ...prevState, isSus: false }));
						toast.success("Authorized", {
							description: "You are now authorized to access the dashboard.",
						});
						setTimeout(() => router.push("/"), 1500);
					} else {
						setAuthInfo((prevState) => ({
							...prevState,
							fails: prevState.fails + 1,
						}));
						if (authInfo.fails + 1 >= 3) {
							activateCaptcha();
						}

						toast.error("Unauthorized", {
							description: "Invalid domain or key.",
						});
						setLoading(false);
					}
				});
			});

			socketInstance.on("connect_error", (error) => {
				toast.error("Connection Error", {
					description: "Unable to connect to the server.",
				});
				socketInstance.close();
				setLoading(false);
			});

			socketInstance.on("disconnect", () => {
				toast.error("Unauthorized", {
					description: "Invalid domain or key.",
				});
				setLoading(false);
				socketInstance.close();
			});
		} catch (e) {
			toast.error("Unauthorized", {
				description: "Invalid domain or key.",
			});
			setLoading(false);
		}
	};

	return (
		<main className="flex flex-col items-center gap-2 w-full">
			<Image src="/assets/auth/amogus_card.png" width={100} height={100} alt="Among Dashboard Logo" />
			{/* <h1 className="text-2xl font-semibold">Among Dashboard</h1> */}
			{authInfo.isSus ? (
				<>
					<h2 className="text-medium text-center">
						Please complete the captcha to continue.
					</h2>
					<Captcha />
				</>
			) : (
				<div className="flex flex-col gap-2 w-full max-w-[400px]">
					<Input
						placeholder="Domain (s.us)"
						value={authInfo.domain}
						onChange={handleChange("domain")}
					/>
					<Input
						placeholder="Key (aG1tIHlvdSBzbWVsbCBzdXM=)"
						value={authInfo.key}
						onChange={handleChange("key")}
						type="password"
						classNames={{ inputWrapper: "pr-1" }}
						endContent={
							<Button
								isIconOnly
								size="sm"
								color="primary"
								isLoading={loading}
								onClick={handleAuth}
								isDisabled={authInfo.isSus}
							>
								<ArrowRight />
							</Button>
						}
					/>
				</div>
			)}
		</main>
	);
}

export default AuthPage;
