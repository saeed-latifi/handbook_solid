import { CardCenter } from "./CardCenter";
import { Button } from "../button/Button";

export function CardError({ onHandleError }: { onHandleError?: () => void }) {
	return (
		<CardCenter>
			<div class="flex flex-col p-8 gap-4 items-center justify-center text-center border border-red-500 rounded-2xl bg-white">
				<p>خطایی رخ داده است!</p>
				<p>چند لحظه دیگر مجددا امتحان کنید</p>
				<Button onClick={() => (onHandleError ? onHandleError() : window.location.reload())}>تلاش مجدد</Button>
			</div>
		</CardCenter>
	);
}
