import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { ChatInterface } from "@/components/workspace/ChatInterface";
import { getCurrentUser, connectWorkspace as connectWorkspaceAPI } from "@/lib/auth";
import { DatabaseConnectionModal } from "@/components/workspace/DatabaseConnectionModal.jsx";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import { useToast } from "@/hooks/use-toast";


export default function Workspace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const {
    currentWorkspace,
    updateWorkspaceStatus,
    history,
    loadConversationHistory,
  } = useWorkspace();

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  // Auto-connect workspace if it has saved database config
  useEffect(() => {
    if (currentWorkspace && currentWorkspace.status === "connected") {
      // Already connected, nothing to do
      return;
    }

    if (currentWorkspace?.dbConfig && currentWorkspace.status !== "connected") {
      // Workspace has saved config but is not connected - auto-connect
      console.log("🔄 Auto-connecting workspace with saved database config...");
      handleAutoConnect();
    }
  }, [currentWorkspace?.id]); // Only run when workspace changes

  if (!user) return null;

  // Auto-connect using saved DB config
  const handleAutoConnect = async () => {
    if (!currentWorkspace) return;

    setConnecting(true);
    updateWorkspaceStatus(currentWorkspace.id, "pending");

    try {
      // Just send db_name - backend will fetch the config from dbinfos
      const result = await connectWorkspaceAPI({
        db_name: currentWorkspace.db_id,
      });

      updateWorkspaceStatus(currentWorkspace.id, "connected", {
        connectionResult: result,
      });
      loadConversationHistory(
        result.workspace_id || currentWorkspace.id,
        result.conversation_history || []
      );

      toast({
        title: "Auto-Connected!",
        description: `${currentWorkspace.name} is ready to use.`,
      });
    } catch (err) {
      console.error("Auto-connection error:", err);
      updateWorkspaceStatus(currentWorkspace.id, "failed");
      toast({
        title: "Connection Failed",
        description: err.message || "Unable to connect to database.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  // Called when user needs to manually enter DB config (first time or to change config)
  const handleDbConnected = async (config) => {
    if (!currentWorkspace) {
      toast({
        title: "Error",
        description: "No workspace selected.",
        variant: "destructive",
      });
      return;
    }

    setDbModalOpen(false);
    setConnecting(true);
    updateWorkspaceStatus(currentWorkspace.id, "pending");

    try {
      // Backend currently stores DB config when a workspace is created.
      // Reconnect by db_name; keep the entered config in local state for the session.
      const result = await connectWorkspaceAPI({
        db_name: currentWorkspace.db_id,
      });

      updateWorkspaceStatus(currentWorkspace.id, "connected", {
        dbConfig: config,
        connectionResult: result,
      });
      loadConversationHistory(
        result.workspace_id || currentWorkspace.id,
        result.conversation_history || []
      );

      toast({
        title: "Connected!",
        description: `${currentWorkspace.name} is now connected.`,
      });
    } catch (err) {
      console.error("Connection error:", err);
      updateWorkspaceStatus(currentWorkspace.id, "failed");
      toast({
        title: "Connection Failed",
        description: err.message || "Unable to connect to database.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  // Show manual connection only if workspace has NO saved config
  const shouldShowManualConnect =
    currentWorkspace &&
    currentWorkspace.status !== "connected" &&
    !currentWorkspace.dbConfig;

  const handleReconnect = () => {
    // Allow user to change database config
    setDbModalOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WorkspaceSidebar history={history} onSelectQuery={setSelectedQuery} />

        <div className="flex-1 flex flex-col">
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-16 border-b border-gray-800 bg-[#0F0F10] px-6 flex items-center justify-between"
          >
            <div>
              <h1 className="text-lg font-semibold text-white">
                {currentWorkspace?.name || "Workspace"}
              </h1>
              {currentWorkspace?.dbConfig?.database && (
                <p className="text-xs text-gray-400">
                  {currentWorkspace.dbConfig.database}
                </p>
              )}
            </div>
          </motion.header>

          <main className="flex-1 overflow-hidden p-4">
            {currentWorkspace?.status === "connected" ? (
              <ChatInterface
                initialQuery={selectedQuery}
              />
            ) : currentWorkspace?.status === "pending" || connecting ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>Connecting to {currentWorkspace?.name}...</p>
              </div>
            ) : currentWorkspace?.status === "failed" ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
                <p className="text-red-500">Connection failed</p>
                {currentWorkspace?.dbConfig ? (
                  <>
                    <Button
                      onClick={handleAutoConnect}
                      className="bg-primary hover:bg-primary/90"
                      disabled={connecting}
                    >
                      Retry Connection
                    </Button>
                    <Button
                      onClick={handleReconnect}
                      variant="outline"
                    >
                      Change Database Config
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setDbModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Configure Database
                  </Button>
                )}
              </div>
            ) : shouldShowManualConnect ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
                <p>Database configuration required</p>
                <Button
                  onClick={() => setDbModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Configure Database
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
                <p>Select a workspace to get started</p>
              </div>
            )}
          </main>

          {/* Database Connection Modal */}
          <DatabaseConnectionModal
            open={dbModalOpen}
            onClose={() => setDbModalOpen(false)}
            onConnect={handleDbConnected}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
