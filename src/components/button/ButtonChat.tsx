import { ButtonRound } from "./ButtonRound";
import { IconChat } from "../icons/IconChat";
import ModalChat from "../modal/modal.chat";
import { useModal } from "../../context/modal.context";

export default function ButtonChat(props: { route?: string }) {
	const { showModal: onModal, closeModal: onClear } = useModal();

	function onModalChat() {
		onModal(<ModalChat onCloseModal={onClear} />);
	}

	return (
		<ButtonRound onClick={onModalChat}>
			<IconChat />
		</ButtonRound>
	);
}
