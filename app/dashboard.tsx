import { AddNewPrompt } from "@/components/add-new-prompt";

export default function Dashboard() {
  return (
    <div className="flex flex-col flex-1 p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <AddNewPrompt />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Welcome back</p>
    </div>
  );
}
