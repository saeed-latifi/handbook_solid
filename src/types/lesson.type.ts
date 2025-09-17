import { IAuthor } from "./author.type";
import { IScore } from "./score.type";

export type ILesson = {
	id: number;
	SeasonId: number;
	title: string;
	description?: string;
	createdAt?: Date;
	startedAt?: Date;
	avatar?: string;
	sort?: number;
	online?: boolean;
	videoId?: string;
	Prerequisite?: number;
	lock?: boolean;
	active: boolean;
	status: "Waiting" | "InProgress" | "Ended";
	meta?: string;
	progress?: IProgress[];
	score: IScore[];

	author: IAuthor;
};
