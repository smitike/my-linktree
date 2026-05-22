import { createFileRoute } from "@tanstack/react-router";
import { LinkTree } from "@/components/linktree/link-tree";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <LinkTree />;
}
