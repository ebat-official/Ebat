import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
		ppr: "incremental",
		nodeMiddleware: true,
	},
};

export default nextConfig;
