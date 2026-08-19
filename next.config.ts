import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db', './dev.db'],
    '/**/*': ['./prisma/dev.db', './dev.db'],
  },
};

export default nextConfig;
