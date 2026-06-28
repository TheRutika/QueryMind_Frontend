import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Database,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import WorkspaceModal from "@/components/workspace/WorkspaceModal.jsx";
import { DatabaseConnectionModal } from "@/components/workspace/DatabaseConnectionModal.jsx";

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
  const [pendingWorkspaceName, setPendingWorkspaceName] = useState(null);

  // Workspace name entered - now ask for DB config
  const handleWorkspaceCreated = (workspaceName) => {
    setPendingWorkspaceName(workspaceName);
    setDbModalOpen(true);
  };

  // DB config entered - now create workspace WITH DB config
  const handleDbConnected = async (config) => {
    if (!pendingWorkspaceName) return;

    setDbModalOpen(false);

    try {
      // Call backend API with BOTH workspace name and DB config
      // Backend expects: workspaceName, db_host, db_user, db_password, db_service, db_name
      const response = await addWorkspace({
        workspaceName: pendingWorkspaceName,
        db_host: config.host,
        db_user: config.user,
        db_password: config.password,
        db_service: config.service,
        db_name: config.database,
      });

      toast({
        title: "Success!",
        description: `Workspace "${pendingWorkspaceName}" created and connected.`,
      });

      // Context already updated the state and set as current workspace
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to create workspace",
        variant: "destructive"
      });
    } finally {
      setPendingWorkspaceName(null);
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
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {history.filter((h) => h.workspaceId === currentWorkspace?.id).length > 0 ? (
              history
                .filter((h) => h.workspaceId === currentWorkspace?.id)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-md border border-gray-800 bg-gray-950/40 px-3 py-2 text-left hover:border-purple-500/60 hover:bg-purple-500/10"
                    onClick={() => onSelectQuery && onSelectQuery(item)}
                  >
                    <div className="truncate text-sm text-gray-200">
                      {item.english || item.question || "Query"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Saved query"}
                    </div>
                  </button>
                ))
            ) : (
              <p className="text-sm text-gray-500">No queries yet</p>
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
