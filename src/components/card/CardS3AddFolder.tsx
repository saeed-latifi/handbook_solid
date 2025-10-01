import { useModal } from "~/context/modal.context";
import ModalBase from "../modal/modal.base";
import CardModal from "./CardModal";
import { IconAddFolder } from "../icons/IconAddFolder";
import { Input } from "../form/Input";
import { createSignal, Match, Switch } from "solid-js";
import { Button } from "../button/Button";
import { http } from "../http";
import { IResponse } from "~/types/response.type";
import { useBucketInfo } from "~/hooks/useBucket";
import { useLocation, useParams } from "@solidjs/router";
import { IS3Prefix } from "~/types/S3";
import toast from "solid-toast";
import { s3FolderPathExtractor } from "~/utils/extractPathSegments";

export function CardS3AddFolder({ bucketName, parents }: { bucketName: string; parents?: string[] }) {
	const params = useParams();
	const { pathname } = useLocation();

	const { onClear, onModal } = useModal();
	const [folderName, setFolderName] = createSignal("");
	const [validations, setValidations] = createSignal<{ folderName?: string[] }>({});

	const { data, isLoading, mutateValue } = useBucketInfo({ name: () => params.bucketName, prefix: () => params.contentPath });

	function onClick() {
		onModal(
			<ModalBase onClear={onClear}>
				<CardModal>
					<div class="w-full flex flex-col gap-8 py-4">
						<Input
							errors={validations().folderName}
							label="نام مسیر"
							value={folderName()}
							onInput={(e) => {
								setFolderName(e.target.value);
								setValidations({});
							}}
						/>
						<Button onClick={() => onCreateFolder()}>افزودن</Button>
					</div>
				</CardModal>
			</ModalBase>
		);
	}

	async function onCreateFolder() {
		const re = pathname.split("/");
		if (re.includes(folderName())) return toast.error("نام مسیر تکراری است");

		if (!data()) return;
		const { data: res } = await http.post<IResponse<{ bucketName: string; folderName: string }>>("/storage/folder", { bucketName, folderName: folderName(), parents });

		if (res.validations) setValidations(res.validations);
		if (!res.data) return;
		const CommonPrefixes: IS3Prefix[] = [{ Prefix: res.data.folderName }, ...(data()?.CommonPrefixes ?? [])];

		console.log({ CommonPrefixes });
		await mutateValue({ CommonPrefixes });
		onClear();
	}

	return (
		<Switch>
			<Match when={isLoading()}>
				<></>
			</Match>

			<Match when={true}>
				<button onClick={onClick} class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
					<div class="flex flex-1 overflow-hidden">
						<div class="w-full h-full flex items-center justify-center p-4">
							<IconAddFolder class="fill-emerald-600 w-full h-full aspect-square max-w-20" />
						</div>
					</div>
					<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">افزودن مسیر</p>
				</button>
			</Match>
		</Switch>
	);
}
