export interface ICourse {
	id: number;
	title: string;
	avatar?: string;
	createdAt?: Date;
	active: boolean;
	description: string;
	sort?: number;
	startedAt?: Date;
}
