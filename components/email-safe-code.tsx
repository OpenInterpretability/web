/**
 * A <code> element whose text Cloudflare's Email Obfuscation leaves alone.
 *
 * The proxy scans HTML for anything that looks like an address and rewrites it
 * to "[email protected]" for clients without JavaScript. Code samples trip it:
 * "migration-guard@v0.1.12" and 'contact: "you@yourorg.org"' are not addresses,
 * but they get mangled. Cloudflare skips whatever sits between
 * <!--email_off--> and <!--/email_off-->, so we emit those around the code.
 *
 * The content is a static literal that we escape by hand (&, <, >), which is
 * why dangerouslySetInnerHTML is safe here.
 */
export function EmailSafeCode({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return (
    <code
      className={className}
      dangerouslySetInnerHTML={{ __html: `<!--email_off-->${escaped}<!--/email_off-->` }}
    />
  )
}
