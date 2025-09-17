import { ComponentListError } from "~/components/test/ComponentListError";
import { ComponentListUser } from "~/components/test/ComponentListUser";
import { ComponentListReady } from "~/components/test/ComponentListReady";
import { ComponentSimple } from "~/components/test/ComponentSimple";

import { keyGenerator } from "~/utils/keyGenerator";
import { ComponentRecord } from "~/components/test/ComponentRecord";
import { ComponentListWait } from "~/components/test/ComponentListWait";
import { ComponentRecordTwo } from "~/components/test/ComponentRecordTwo";

export default function Home() {
	return (
		<div class="w-full flex flex-col gap-4 p-4">
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
			<p>{JSON.stringify(keyGenerator({ b: 5, a: 1, c: { b: 3, a: 1, c: [] }, d: {} }))}</p>
		</div>
	);
}
