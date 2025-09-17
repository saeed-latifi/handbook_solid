import { useNavigate } from "@solidjs/router";
import { ButtonRound } from "./ButtonRound";
import { IconBack } from "../icons/IconBack";

export default function ButtonBack() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(-1); // Go back one page in history
	};

	return (
		<ButtonRound onClick={handleClick}>
			<IconBack />
		</ButtonRound>
	);
}
