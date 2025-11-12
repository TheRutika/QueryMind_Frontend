 import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function WorkspaceModal({ open, onClose, onWorkspaceCreated }) {
  const [workspaceName, setWorkspaceName] = useState("");

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim()) {
      toast({ title: "Please enter a workspace name" });
      return;
    }

    const newWorkspace = {
      id: Date.now(), // unique ID
      name: workspaceName.trim(),
      status: "pending", // pending until DB connected
    };

    onWorkspaceCreated(newWorkspace);

    toast({
      title: "Workspace created",
      description: `${workspaceName} created successfully.`,
    });

    setWorkspaceName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label htmlFor="workspace-name">Workspace Name</Label>
          <Input
            id="workspace-name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. Sales Analytics"
            className="glass-card"
          />
        </div>

        <DialogFooter>
          <Button onClick={handleCreateWorkspace} className="bg-primary hover:bg-primary/90">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
