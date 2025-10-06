const config = {
  // Ensure correct root detection when used in a workspace/monorepo
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
} satisfies import('next').NextConfig;

export default config;
