/**
 * Discovery for auth.md (rewritten from /.well-known/oauth-protected-resource[/api/v1] and
 * /.well-known/oauth-authorization-server): RFC 9728 Protected Resource Metadata and RFC 8414 Authorization Server
 * metadata with the auth.md `agent_auth` block. ?doc=prm | as.
 */
import { BASE, CLAIM_GRANT, JWT_BEARER_GRANT, PATHS, RESOURCE, SCOPES } from "@/lib/agent-auth"

export const dynamic = "force-dynamic"

const prm = {
  resource: RESOURCE,
  resource_name: "Ekbasis API (OpenInterpretability)",
  resource_logo_uri: `${BASE}/icon.svg`,
  resource_documentation: `${BASE}/ekbasis/agents.md`,
  authorization_servers: [BASE],
  scopes_supported: SCOPES,
  bearer_methods_supported: ["header"],
}

const as = {
  ...prm,
  issuer: BASE,
  token_endpoint: `${BASE}${PATHS.token}`,
  revocation_endpoint: `${BASE}${PATHS.revoke}`,
  grant_types_supported: [JWT_BEARER_GRANT, CLAIM_GRANT],
  agent_auth: {
    skill: `${BASE}${PATHS.skill}`,
    identity_endpoint: `${BASE}${PATHS.identity}`,
    claim_endpoint: `${BASE}${PATHS.claim}`,
    identity_types_supported: ["service_auth"],
  },
}

export function GET(req: Request) {
  const doc = new URL(req.url).searchParams.get("doc")
  return Response.json(doc === "as" ? as : prm, {
    headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" },
  })
}
