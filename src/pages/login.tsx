import { storageUrl } from "~/appConfig";
import { Button } from "../components/button/Button";
import { Form } from "../components/form/Form";
import { Input } from "../components/form/Input";
import { IconLock } from "../components/icons/IconLock";
import { IconPhone } from "../components/icons/IconPhone";
import { IconRefresh } from "../components/icons/IconRefresh";
import { useAccount } from "../hooks/useAccount";

export function LoginPage() {
	const { onLogin, onChange, data, onForget, response } = useAccount();

	async function onSubmit(event: Event) {
		event.preventDefault();

		const res = data();
		if (res) await onLogin(res);
	}

	return (
		<Form onSubmit={onSubmit} class="items-center justify-center">
			<div class="flex flex-col items-center w-full max-w-md h-max">
				<img src={storageUrl + "/public/logo.webp"} class="w-full h-full" alt="Login illustration" />
			</div>
			<div class="w-full flex flex-col items-center text-center py-4 gap-1">
				<p class="font-peyda-bold text-lg">ورود</p>
			</div>

			<Input
				id="phone"
				icon={<IconPhone class="w-5 h-5" />}
				name="phone"
				placeholder="شماره همراه"
				value={data()?.phone || ""}
				oninput={(e) => onChange({ phone: e.target.value })}
				errors={response()?.validations?.phone}
			/>
			<Input
				id="password"
				icon={<IconLock class="w-5 h-5" />}
				name="password"
				type="password"
				placeholder="رمز ورود"
				value={data()?.password || ""}
				oninput={(e) => onChange({ password: e.target.value })}
				errors={response()?.validations?.password}
			/>

			<div class="flex pb-4 w-full justify-end text-action fill-action">
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						onForget(data()?.phone);
					}}
					class="flex items-center gap-2 text-xs px-4 clicker"
				>
					<IconRefresh class="w-3 h-3" />
					<p>فراموشی رمز عبور</p>
				</button>
			</div>
			<Button class="w-full" type="submit">
				شروع کنید
			</Button>
		</Form>
	);
}
