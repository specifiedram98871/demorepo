import { KanbanBoard } from "@/components/board/kanban-board";

export default function BoardPage() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Issue Board</h2>
        <p className="text-slate-500">Drag cards between columns with optimistic updates and offline queue support.</p>
      </div>
      <KanbanBoard />
    </section>
  );
}
