import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NADA.EXE — Retro 8-Bit Date Quest" },
      {
        name: "description",
        content:
          "A goofy 90s-style pixel game where the YES button grows, the NO button shrinks, and pixel cats judge every decision.",
      },
      { property: "og:title", content: "NADA.EXE — Retro 8-Bit Date Quest" },
      {
        property: "og:description",
        content: "Press START, dodge the shrinking NO button, and schedule the perfect pixel date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/game/index.html"
      title="NADA.EXE retro 8-bit date quest"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
    />
  );
}
