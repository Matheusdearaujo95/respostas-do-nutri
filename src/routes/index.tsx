import { createFileRoute } from "@tanstack/react-router";
import { EditorialStudio } from "../components/editorial/EditorialStudio";

export const Route = createFileRoute("/")({
  component: EditorialStudio,
});
