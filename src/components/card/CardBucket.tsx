import { useBucket } from "~/hooks/useBucket";
import { IBucket } from "~/types/bucket.type copy";
import { IconBucket } from "../icons/IconBucket";
import IconDelete from "../icons/IconDelete";
import { useNavigate } from "@solidjs/router";

export function CardBucket({ bucket }: { bucket: IBucket }) {
	const { deleteBucket } = useBucket();
	const navigate = useNavigate();

	return (
		<div onClick={() => navigate(`/storage/${bucket.Name}`)} class="clicker bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
			<div class="flex p-2 flex-1 aspect-square">
				<IconBucket class="fill-indigo-600" />
			</div>
			<p class="w-full bg-gray-200 px-4 py-1 font-peyda-bold truncate">{bucket.Name}</p>

			<button
				class="flex items-center justify-center bg-white rounded-full border border-red-600 p-1 absolute top-2 left-2"
				onClick={async (e) => {
					e.stopPropagation();
					console.log(888);

					// const d = await deleteBucket(bucket.Name);
				}}
			>
				<IconDelete class="fill-red-600 w-5 h-5 min-w-5" />
			</button>
		</div>
	);
}
