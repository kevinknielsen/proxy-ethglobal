/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fallbacks for server-side modules
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    // Externalize packages with native bindings
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Externalize Envio HyperSync client to prevent webpack from bundling native bindings
    if (isServer) {
      config.externals.push('@envio-dev/hypersync-client');
    }

    // Ignore .node files - they are native bindings
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
    });

    return config;
  },
  // Ensure server components can use these packages
  experimental: {
    serverComponentsExternalPackages: ['@envio-dev/hypersync-client'],
  },
}

module.exports = nextConfig

