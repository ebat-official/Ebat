import { v4 as uuidv4 } from "uuid";

function generateUniqueUsername(email: string) {
	const emailPrefix = email.split("@")[0];
	const username = `${emailPrefix}_${uuidv4()}`.slice(0, 16);
	return username;
}

export { generateUniqueUsername };
