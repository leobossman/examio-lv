import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/pieslegties")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Pieslēgties | Examio" },
      { name: "description", content: "Pieslēdzies Examio, lai turpinātu gatavoties CE." },
      { property: "og:title", content: "Pieslēgties | Examio" },
      { property: "og:description", content: "Turpini gatavošanos valsts eksāmeniem." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
