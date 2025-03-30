import { Image } from "lucide-react";
export type Zone = {
	title: string;
	subtitle: string;
	icon: React.ElementType;
	gradient: string;
	rotate: string;
};

export const zones: Zone[] = [
	{
		title: "Upload Images",
		subtitle: "Drop images here",
		icon: Image,
		gradient: "from-purple-400 via-pink-500 to-red-500",
		rotate: "-rotate-2",
	},
	// Uncomment and add more zones as needed
	// {
	//   title: "Upload Videos",
	//   subtitle: "Drop videos here",
	//   icon: Video,
	//   gradient: "from-blue-400 via-teal-500 to-green-500",
	//   rotate: "",
	// },
	// {
	//   title: "Upload Files",
	//   subtitle: "Drop files here",
	//   icon: UploadCloudIcon,
	//   gradient: "from-yellow-400 via-orange-500 to-red-500",
	//   rotate: "rotate-3",
	// },
];
