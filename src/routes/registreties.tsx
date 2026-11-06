import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/registreties")({
  head: () => ({
    meta: [
      { title: "Reģistrēties | Examio" },
      { name: "description", content: "Izveido Examio kontu un sāc gatavoties CE." },
      { property: "og:title", content: "Reģistrēties | Examio" },
      { property: "og:description", content: "Izveido kontu un saņem personīgu CE plānu." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
