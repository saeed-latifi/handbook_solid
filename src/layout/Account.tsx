import { ButtonRound } from "../components/button/ButtonRound";
import Popup from "../components/common/Popup";
import { IconLogo } from "../components/icons/IconLogo";
import { useAccount } from "../hooks/useAccount";

export function Account() {
	const { data, onLogout } = useAccount();

	const popupItems = () =>
		// user()
		// 	?
		[
			{
				id: "login",
				title: <span class="p-2 flex items-center justify-center">خروج</span>,
				onClick: onLogout,
			},
		];
	// : [];

	return (
		<Popup
			position={{ top: 45, left: -5 }}
			itemPadding="py-2 px-3"
			label={
				<div class="flex items-center justify-center gap-4">
					<ButtonRound>
						<IconLogo />
					</ButtonRound>
					{data() && <p class="text-xs">{data()?.name}</p>}
				</div>
			}
			content={popupItems()}
		/>
	);
}
