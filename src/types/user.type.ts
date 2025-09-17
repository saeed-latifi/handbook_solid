export type IUser = {
	id: number;
	name: string;
	family: string;
	phone: string;
	avatar?: string;
	groupId?: number;
	supportId?: number;
	createdAt?: Date;
	role: "Student" | "Admin";
	state: "Active" | "Inactive";
	cancel: "Ok" | "Cancel";

	//
	password?: string;
};
