import ModalBase from "./modal.base";
import { IconChat } from "../icons/IconChat";
import CardModal from "../card/CardModal";

export default function ModalChat(props: { onCloseModal: () => void }) {
	return (
		<ModalBase onClear={props.onCloseModal}>
			<CardModal>
				<a
					href="/chat"
					//  onClick={() => handleNavigate("/chat")}
					class="flex clicker items-center gap-2 p-4 border-b border-border w-full text-left"
				>
					<span class="rounded-full fill-white bg-rose-600 p-2">
						<IconChat class="h-5 w-5" />
					</span>
					<span>ارتباط با پشتیبان</span>
				</a>
				{/* Repeat for other buttons */}
			</CardModal>
		</ModalBase>
	);
}
