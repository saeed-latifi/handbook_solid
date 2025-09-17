export type ISeason = {
	id: number;
	courseId: number;
	title: string;
	description?: string;
	createdAt?: Date;
	startedAt?: Date;
	avatar?: string;
	active: boolean;
	parentId?: number;
	sort?: number;
};
