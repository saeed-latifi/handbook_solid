import { useAccount } from "~/hooks/useAccount";
import { ComponentStorageBucket } from "~/components/test/ComponentStorageBucket";

export default function Home() {
	const { response, data, onChange } = useAccount();

	return (
		<div class="w-full flex flex-col gap-4 p-4">
			<ComponentStorageBucket />
		</div>
	);
}
