import { useAccount } from "~/hooks/useAccount";
import { Input } from "~/components/form/Input";
import { IconLock } from "~/components/icons/IconLock";
import { ComponentRecord } from "~/components/test/ComponentRecord";
import { ComponentRecordTwo } from "~/components/test/ComponentRecordTwo";
import { ComponentListUser } from "~/components/test/ComponentListUser";
import { ComponentListWait } from "~/components/test/ComponentListWait";
import { ComponentListReady } from "~/components/test/ComponentListReady";
import { ComponentListError } from "~/components/test/ComponentListError";
import { ComponentSimple } from "~/components/test/ComponentSimple";
import { keyGenerator } from "~/utils/keyGenerator";
import { ShowUser, MutateUser } from "~/components/test/CC";
import { CCInfinite } from "~/components/test/CCInfinite";
import { MutateList, ShowList } from "~/components/test/CCList";

export default function TestPage() {
	const { response, data, onChange } = useAccount();

	return (
		<div class="w-full flex flex-col gap-4 p-4">
			{/* <ShowUser /> */}
			{/* <ShowUser />
			<ShowUser />
			<MutateUser /> */}
			<CCInfinite />
			{/* <ShowList /> */}
			{/* <MutateList /> */}
			{/* <ComponentCash />
			<ComponentCash />

			<ComponentCashMutate /> */}
			{/* <Input
				id="password"
				icon={<IconLock class="w-5 h-5" />}
				name="password"
				type="password"
				placeholder="رمز ورود"
				value={data()?.password || ""}
				oninput={(e) => onChange({ password: e.target.value })}
				errors={response()?.validations?.password}
			/>
			<ComponentRecord />
			<ComponentRecord />
			<ComponentRecordTwo />
			<ComponentListUser />
			<ComponentListWait />
			<ComponentListWait />
			<ComponentListReady />
			<ComponentListReady />
			<ComponentListError />
			<ComponentSimple />
			<ComponentSimple />

			<p>{JSON.stringify(keyGenerator({ arr: [null, undefined, NaN, ""] }))}</p>
			<p>{JSON.stringify(keyGenerator({ a: null, b: undefined, c: NaN, d: "", e: [] }))}</p>
			<p>{JSON.stringify(keyGenerator({ b: 5, a: 1, c: { b: 3, a: 1, c: [] }, d: {} }))}</p> */}
		</div>
	);
}
