"use client";
import Image from "next/image";
import Link from "next/link";
import useScroll from "@/components/hooks/useScroll";
import ThemeSwitcher from "./ThemeSwitcher";
import UserButton from "./UserButton";
import { Session } from "next-auth";
import LoginModal from "@/components/auth/LoginModal";
import logo from "@/assets/img/logo.webp";
import { SheetMenu } from "@/components/sidebar/sheet-menu";

export default function NavBar({ session }: { session: Session | null }) {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={`sticky top-0 w-full flex justify-center ${
          scrolled
            ? "border-b dark:border-gray-900 border-gray-200 bg-white/50 dark:bg-black/80 backdrop-blur-xl"
            : "bg-white/0"
        } z-10 transition-all`}
      >
        <div className="flex items-center justify-between w-full h-16 max-w-screen-xl mx-5">
          <div>
        <SheetMenu />
          </div>
          <div className="flex gap-4">
            <ThemeSwitcher />

            {session ? <UserButton session={session} /> : <LoginModal />}
          </div>
        </div>
      </div>
    </>
  );
}
