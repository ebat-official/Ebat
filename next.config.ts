import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.ebat.dev",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "*.googleusercontent.com",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "*.githubusercontent.com",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "*.licdn.com",
				port: "",
				pathname: "**",
			},
		],
	},
	experimental: {
		reactCompiler: true,
		ppr: "incremental",
		serverActions: {
			bodySizeLimit: "5mb",
		},
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
