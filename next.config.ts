import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["storage.ebat.dev"],
	},
	experimental: {
		reactCompiler: true,
		ppr: "incremental",
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "require-corp",
					},
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
				],
			},
		];
	},
};

export default nextConfig;
