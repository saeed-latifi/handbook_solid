import { useLocation, useNavigate } from "@solidjs/router";

import { createSignal, createEffect } from "solid-js";
import { IconHome } from "../components/icons/IconHome";
import { IconCourse } from "../components/icons/IconCourse";
import { IconTutor } from "../components/icons/IconTutor";
import { IconExit } from "../components/icons/IconExit";
import { useAccount } from "../hooks/useAccount";

export function Footer() {
	const { data, onLogout } = useAccount();
	const location = useLocation();
	const navigate = useNavigate();

	const [selected, setSelected] = createSignal("");

	createEffect(() => {
		const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");
		setSelected(pathSegments[0] ?? "");
	});

	const handleLogout = () => {
		if (data()?.id) {
			onLogout();
		}
	};

	return (
		<footer class="sticky bottom-0 w-full px-4 pb-3 pt-1 flex items-center justify-center z-50 bg-background text-xs bg-tile ">
			<div class="w-full flex items-center justify-evenly flex-1 max-w-5xl gap-1 bg-white px-4 py-2 rounded-full  border-border shadow-footer">
				<FooterItem icon={<IconHome class="w-4 h-4" />} title="خانه" selected={selected()} value="" onClick={() => navigate("/")} />
				<FooterItem icon={<IconCourse class="w-4 h-4" />} title="دوره های من" selected={selected()} value="courses" onClick={() => navigate("/courses")} />
				<FooterItem icon={<IconTutor class="w-4 h-4" />} title="پرداخت ها" selected={selected()} value="payments" onClick={() => navigate("/payments")} />
				<FooterItem icon={<IconExit class="w-4 h-4" />} title="خروج" selected={selected()} value="logout" onClick={handleLogout} />
			</div>
		</footer>
	);
}

function FooterItem(props: { icon: any; title: string; selected: string; value: string; onClick?: () => void }) {
	return (
		<button onClick={props.onClick} class="flex flex-col gap-2 items-center justify-between clicker text-text text-center min-w-fit relative">
			{props.selected === props.value ? (
				<>
					<div class="absolute flex flex-col gap-1 items-center justify-center bottom-7 bg-white rounded-full aspect-square min-w-12 w-12 border-2 text-text text-center shadow-center border-background">
						{props.icon}
					</div>
					<span class="flex-1">.</span>
				</>
			) : (
				props.icon
			)}

			<span class="">{props.title}</span>
		</button>
	);
}
