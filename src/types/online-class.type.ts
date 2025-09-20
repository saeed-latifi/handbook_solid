import { IAuthor } from "./author.type";

export interface IOnlineClass {
	id: number;
	title: string;
	avatar?: string;
	createdDate?: Date;
	active: "Active" | "Inactive";
	description: string;
	sort?: number;
	author: IAuthor;
	startDate: Date;
	imageUrl?: string;
	state: OnlineClassState;
}

export const OnlineClassState = {
	InProgress: "InProgress",
	Waiting: "Waiting",
	Done: "Done",
} as const;

export type OnlineClassState = (typeof OnlineClassState)[keyof typeof OnlineClassState];
