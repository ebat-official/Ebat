import Navbar from "./Navbar";
import { useSession } from "@/lib/auth-client";

export default function Nav() {
	const { data: session } = useSession();
	return <Navbar session={session} />;
}
