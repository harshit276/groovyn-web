/**
 * Structured data. Kept as a component so every page emits it the same way.
 *
 * Rule we do not break: no AggregateRating until real reviews exist. Fabricated
 * review markup is the fastest way for a directory to earn a manual action.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Escaping `<` prevents a `</script>` inside any string field breaking out.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
