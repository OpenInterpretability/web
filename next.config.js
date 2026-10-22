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
  // 2026-10-22: no page uses next/image, so the Image Optimization API stays off (Next.js October 2026 security
  // release: unauthenticated RCE in that API with SVG). Turn it back on only with next/image actually in use.
  images: { unoptimized: true },
}

module.exports = nextConfig
