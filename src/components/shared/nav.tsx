import { useSession } from "@/lib/auth-client";
import Navbar from "./Navbar";

export default function Nav() {
	const { data: session } = useSession();
	return <Navbar session={session} />;
}
