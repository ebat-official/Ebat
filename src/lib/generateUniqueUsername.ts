import { v4 as uuidv4 } from "uuid";

function generateUniqueUsername(email: string) {
	const emailPrefix = email.split("@")[0];
	const userName = `${emailPrefix}_${uuidv4()}`.slice(0, 16);
	return userName;
}

export { generateUniqueUsername };
