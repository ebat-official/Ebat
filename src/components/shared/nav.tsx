import Navbar from "./Navbar";
import { useSession } from "next-auth/react";

export default function Nav() {
	const { data: session } = useSession();
	return <Navbar session={session} />;
}
