const nextConfig = {
  // Next's output-file tracer doesn't follow Prisma's dynamic engine
  // resolution, so the rhel-openssl-3.0.x query engine (needed on
  // Netlify's Lambda runtime, which differs from its build container)
  // never makes it into the deployed function bundle without this.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
};

export default nextConfig;
