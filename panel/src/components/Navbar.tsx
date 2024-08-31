"use client";
import {
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Navbar,
	Button,
	Avatar,
	NavbarMenuToggle,
	NavbarMenu,
	Spinner,
} from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PanelLogo } from "./PanelLogo";
import { AuthInfo, Clients } from "@/types";
import {
	EarthIcon,
	LogOutIcon,
	SearchCheckIcon,
	UnplugIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
function DashNavbar({
	data,
	authInfo,
}: {
	data: Clients | null;
	authInfo: AuthInfo;
}) {
	const router = useRouter();
	useEffect(() => {
		if (data) {
			console.log(data);
		}
	}, [data]);

	const handleLogout = () => {
		localStorage.removeItem("authInfo");
		router.push("/auth");
	};

	return (
		<Navbar maxWidth="full" isBordered height={"84px"} position="static">
			<NavbarBrand>
				<PanelLogo />
			</NavbarBrand>

			<NavbarContent
				className="hidden sm:flex gap-4"
				justify="center"
			></NavbarContent>
			<NavbarContent justify="end">
				{/* get data sisze */}
				{data ? (
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1">
							<SearchCheckIcon size={16} />
							<p className="text-xs">{authInfo.domain}</p>
						</div>

						<div className="flex items-center gap-1">
							<EarthIcon size={16} />
							<p className="text-xs">Connected: {Object.keys(data).length}</p>
						</div>
					</div>
				) : (
					<Spinner />
				)}
				<Button
					size="sm"
					color="danger"
					variant="flat"
					startContent={<UnplugIcon size={12} />}
					onClick={handleLogout}
				>
					Disconnect
				</Button>
			</NavbarContent>
		</Navbar>
	);
}

export default DashNavbar;
