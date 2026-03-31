import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PM_PROJECTS } from "@/lib/pm-mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const project = PM_PROJECTS.find((p) => p.id === id) ?? PM_PROJECTS[0];
  return <WorkspaceShell project={project} />;
}

export async function generateStaticParams() {
  return PM_PROJECTS.map((p) => ({ id: p.id }));
}
