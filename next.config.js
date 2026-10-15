/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // auth.md (agentic registration): canonical paths from the spec, served by app/api/agent-auth/*
  async rewrites() {
    return [
      { source: '/.well-known/oauth-protected-resource', destination: '/api/agent-auth/well-known?doc=prm' },
      { source: '/.well-known/oauth-protected-resource/api/v1', destination: '/api/agent-auth/well-known?doc=prm' },
      { source: '/.well-known/oauth-authorization-server', destination: '/api/agent-auth/well-known?doc=as' },
      { source: '/agent/identity', destination: '/api/agent-auth/identity' },
      { source: '/agent/identity/claim', destination: '/api/agent-auth/claim' },
      { source: '/oauth2/token', destination: '/api/agent-auth/token' },
      { source: '/oauth2/revoke', destination: '/api/agent-auth/revoke' },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'huggingface.co' },
      { protocol: 'https', hostname: 'cdn-lfs.huggingface.co' },
    ],
  },
}

module.exports = nextConfig
