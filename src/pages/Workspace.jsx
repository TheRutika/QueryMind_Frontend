import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { ChatInterface } from "@/components/workspace/ChatInterface";
import { getCurrentUser } from "@/lib/auth";
import { DatabaseConnectionModal } from "@/components/workspace/DatabaseConnectionModal.jsx";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import { toast } from "@/hooks/use-toast";

// Dummy async function to simulate DB connection
const connectToDB = async (config) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < 0.9 ? resolve(true) : reject(new Error("Failed to connect"));
    }, 1000);
  });
};

export default function Workspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [history, setHistory] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const { currentWorkspace, updateWorkspaceStatus } = useWorkspace();

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  if (!user) return null;

  // Add query to history
  const handleAddToHistory = ({ english, sql, db }) => {
    setHistory((prev) => [{ id: Date.now(), english, sql, db }, ...prev]);
  };

  // Called when user clicks "Connect Database"
  const handleDbConnected = async (config) => {
    if (!currentWorkspace) return;

    setDbModalOpen(false);
    // Show pending status while connecting
    updateWorkspaceStatus(currentWorkspace.id, "pending");

    try {
      await connectToDB(config);

      // Update workspace to connected
      updateWorkspaceStatus(currentWorkspace.id, "connected", { dbConfig: config });

      toast({
        title: "Connected!",
        description: `${currentWorkspace.name} is now ready.`,
      });
    } catch (err) {
      updateWorkspaceStatus(currentWorkspace.id, "failed");
      toast({ title: "Connection Failed", description: err.message });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WorkspaceSidebar history={history} />

        <div className="flex-1 flex flex-col">
          <motion.header>...</motion.header>

          <main className="flex-1 overflow-hidden p-4">
            {currentWorkspace?.status === "connected" ? (
              <ChatInterface
                onNewQuery={handleAddToHistory}
                initialQuery={selectedQuery}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
                <p>Workspace not connected to a database</p>
                <Button
                  onClick={() => setDbModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Connect Database
                </Button>
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
