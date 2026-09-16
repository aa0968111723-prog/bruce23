import { createFileRoute } from "@tanstack/react-router";
import { NotFoundView } from "@/components/site/NotFoundView";

export const Route = createFileRoute("/$")({ component: NotFoundView });
