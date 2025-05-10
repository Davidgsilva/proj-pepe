/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        // Ensure proper server configuration
        serverComponents: true,
    },
    // Configure server to listen on the port provided by Cloud Run
    server: {
        port: process.env.PORT || 8080,
        hostname: process.env.HOSTNAME || '0.0.0.0',
    }
};

export default nextConfig;
