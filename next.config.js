/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ignore optional dependencies that cause warnings
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };

    // Fix for uuid resolution issues in nested dependencies
    try {
      config.resolve.alias = {
        ...config.resolve.alias,
        "uuid": require.resolve("uuid"),
      };
    } catch (e) {
      // uuid might not be installed, that's okay
    }

    // Exclude problematic Solflare metamask SDK from bundle
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        '@solflare-wallet/metamask-sdk': 'commonjs @solflare-wallet/metamask-sdk',
      });
    }

    return config;
  },
};

module.exports = nextConfig;

