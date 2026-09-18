import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/order/$id")({ beforeLoad: () => { throw redirect({ to: "/" }); } });
