/**
 * Renders a JSON-LD block.
 *
 * `JSON.stringify` output is injected via dangerouslySetInnerHTML because that
 * is the only way to emit a raw <script type="application/ld+json"> body —
 * React would otherwise escape the quotes and Google would fail to parse it.
 *
 * It is safe here specifically because the input is a plain object we build
 * ourselves from siteConfig and message files, never user input. The `<` escape
 * below closes the one remaining hole: a string containing "</script>" would
 * otherwise break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
