import axios from "axios";
// import { apiURL } from "../../config";

export const http = axios.create({
	baseURL: "http://localhost:3010/api",
	// baseURL: "https://services.erfankhoshnazar.com/api",
	// baseURL: "https://kakheroshd.ir:448/RedCastlePanel/public/index.php/api/sdk",
	headers: {
		"Content-Type": "application/json",
		//
		"api-token": "B12DznnEghNR1dGhq6xVozr2o4uWwEV4ofosBW3PjoYDRoXVNHmcwFiSqscLNACuPKUQFMrp4AAHUeCQ",
	},

	withCredentials: true,
});
