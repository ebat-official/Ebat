import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["storage.ebat.dev"],
	},
	experimental: {
		reactCompiler: true,
		ppr: "incremental",
	},
};

export default nextConfig;
