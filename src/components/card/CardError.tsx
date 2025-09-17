import { Button } from "../button/Button";
import { CardCenter } from "./CardCenter";

export function CardError(props: { onHandleError?: () => void }) {
	return (
		<CardCenter>
			<div class="flex flex-col p-8 gap-4 items-center justify-center text-center border border-red-500 rounded-2xl bg-white">
				<p>خطایی رخ داده است!</p>
				<p>چند لحظه دیگر مجددا امتحان کنید</p>
				<Button onClick={() => (props.onHandleError ? props.onHandleError() : window.location.reload())}>تلاش مجدد</Button>
			</div>
		</CardCenter>
	);
}
