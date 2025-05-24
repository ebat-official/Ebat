import Image from "next/image";
import icon from "@/assets/img/404.webp";
import Link from "next/link";
import ButtonBlue from "@/components/shared/ButtonBlue";

export default function Component() {
	return (
		<div className="flex min-h-[90dvh] flex-col items-center justify-center  px-4 py-12 ">
			<div className="container mx-auto flex max-w-4xl flex-col-reverse items-center gap-2 md:flex-row md:gap-12">
				<div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center  md:text-left gap-4">
					<h1 className="text-2xl font-bold tracking-tighter sm:text-5xl">
						Hey Coder! 👨‍💻
					</h1>
					<p className="max-w-[450px] text-gray-500 dark:text-gray-400 text-center">
						Our adventurous bat tried to fly here, but even it couldn't reach
						this page.
					</p>

					<Link href="/" prefetch={false}>
						<ButtonBlue type="submit" title="Go to Homepage" />
					</Link>
				</div>
				<div className="flex flex-1 justify-center">
					<Image
						src={icon}
						width={500}
						height={500}
						alt="404 Illustration"
						className="max-w-[300px] sm:max-w-[400px] md:max-w-[400px]"
						style={{ aspectRatio: "500/500", objectFit: "cover" }}
					/>
				</div>
			</div>
		</div>
	);
}
