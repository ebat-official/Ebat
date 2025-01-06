import Navbar from "./Navbar";
import { handlers, auth, signIn, signOut } from "@/auth";

export default async function Nav() {
  const session = await auth();
  return <Navbar session={session} />;
}
