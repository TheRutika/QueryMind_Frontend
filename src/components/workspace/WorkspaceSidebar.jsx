import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Database,
  PlusCircle,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import WorkspaceModal from "@/components/workspace/WorkspaceModal.jsx";
import { DatabaseConnectionModal } from "@/components/workspace/DatabaseConnectionModal.jsx";

// Dummy DB connection
const connectToDB = async (config) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < 0.9 ? resolve(true) : reject(new Error("Failed to connect"));
    }, 1000);
  });
};

export default function WorkspaceSidebar({ history, onSelectQuery }) {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspaceStatus,
  } = useWorkspace();

  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState(null);

  // Workspace created
  const handleWorkspaceCreated = (newWorkspace) => {
    addWorkspace(newWorkspace);
    setPendingWorkspaceId(newWorkspace.id);
    setDbModalOpen(true);
  };

  // DB connected
  const handleDbConnected = async (config) => {
    if (!pendingWorkspaceId) return;

    setDbModalOpen(false);
    updateWorkspaceStatus(pendingWorkspaceId, "pending"); // show pending while connecting

    try {
      await connectToDB(config);

      updateWorkspaceStatus(pendingWorkspaceId, "connected", { dbConfig: config });
      toast({
        title: "Connected!",
        description: `Workspace is now ready.`,
      });
    } catch (err) {
      updateWorkspaceStatus(pendingWorkspaceId, "failed");
      toast({ title: "Connection Failed", description: err.message });
    } finally {
      setPendingWorkspaceId(null);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "connected") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "failed") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="h-full w-64 border-r bg-[#0F0F10] flex flex-col text-white">
      <div className="p-4 border-b border-gray-800 font-bold text-lg flex items-center gap-2 text-purple-400">
        <Database className="h-5 w-5" /> QueryMind
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="text-xs uppercase text-gray-400 mb-2">Workspaces</h3>
        <div className="space-y-1">
          {workspaces.map((ws) => (
            <Button
              key={ws.id}
              variant="ghost"
              size="sm"
              className={`w-full justify-between ${
                currentWorkspace?.id === ws.id ? "bg-purple-600/20" : ""
              }`}
              onClick={() => setCurrentWorkspace(ws)}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(ws.status)}
                {ws.name}
              </div>
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-2"
            onClick={() => setWorkspaceModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Workspace
          </Button>
        </div>

        {/* History */}
        <div className="mt-6">
          <h3 className="text-xs uppercase text-gray-400 mb-2">History</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.filter((h) => h.workspaceId === currentWorkspace?.id).length > 0 ? (
              history
                .filter((h) => h.workspaceId === currentWorkspace?.id)
                .map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm text-gray-200 hover:text-white"
                    onClick={() => onSelectQuery && onSelectQuery(item)}
                  >
                    {item.english || item.question || "Query"}
                  </Button>
                ))
            ) : (
              <p className="text-sm text-gray-500">History will be coming soon</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorkspaceModal
        open={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      <DatabaseConnectionModal
        open={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        onConnect={handleDbConnected}
      />
    </div>
  );
}
