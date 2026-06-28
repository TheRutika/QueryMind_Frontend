import { createContext, useContext, useState, useEffect } from "react";
import { getWorkspaces, addWorkspace as apiAddWorkspace, connectWorkspace as apiConnectWorkspace } from "@/lib/auth";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load workspaces from backend on mount (only if user is logged in)
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        // Only fetch if user has a token (is logged in)
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.log("No token found - skipping workspace fetch");
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await getWorkspaces();
        const workspacesArray = Array.isArray(data) ? data : data.workspaces || [];
        setWorkspaces(workspacesArray);
        if (workspacesArray.length > 0) {
          setCurrentWorkspace(workspacesArray[0]);
        }
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
        setError(err.message);
        // Fallback to empty array - don't crash if backend is down
        setWorkspaces([]);
        console.log("Backend unreachable during startup. Continue with empty workspaces.");
      } finally {
        setLoading(false);
      }
    };

    // Give frontend a second to load even if backend is down
    setTimeout(() => fetchWorkspaces(), 500);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("queryHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(history));
  }, [history]);

  // Add new workspace via API
  const addWorkspace = async (workspaceData) => {
    try {
      const result = await apiAddWorkspace(workspaceData);
      const newWorkspace = result.workspace || result;
      
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      setError(null);
      return newWorkspace;
    } catch (err) {
      console.error("Failed to add workspace:", err);
      setError(err.message);
      throw err;
    }
  };

  // Connect workspace via API (for database configuration)
  const connectWorkspace = async (workspaceId, connectionConfig) => {
    try {
      const result = await apiConnectWorkspace({
        workspaceId,
        ...connectionConfig,
      });
      
      // Update the workspace status in state
      setWorkspaces((prev) =>
        prev.map((ws) => 
          ws.id === workspaceId ? { ...ws, status: "connected", ...result } : ws
        )
      );
      
      setError(null);
      return result;
    } catch (err) {
      console.error("Failed to connect workspace:", err);
      setError(err.message);
      throw err;
    }
  };

  // Update workspace status
  const updateWorkspaceStatus = (id, status, extra = {}) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === id) {
          const updated = { ...ws, status, ...extra };
          if (currentWorkspace?.id === id) setCurrentWorkspace(updated);
          return updated;
        }
        return ws;
      })
    );
  };

  const updateCurrentWorkspace = (extra = {}) => {
    if (!currentWorkspace?.id) return;

    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === currentWorkspace.id ? { ...ws, ...extra } : ws))
    );
    setCurrentWorkspace((prev) => (prev ? { ...prev, ...extra } : prev));
  };

  // Add query to history
  const addHistory = (question, sql, results = []) => {
    if (!currentWorkspace) return;
    const newEntry = {
      id: Date.now(),
      question,
      sql,
      results,
      workspaceId: currentWorkspace.id,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const loadConversationHistory = (workspaceId, messages = []) => {
    if (!workspaceId || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    const entries = [];
    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];
      if (message.role !== "user") {
        continue;
      }

      const assistant = messages.slice(index + 1).find((item) => item.role === "assistant");
      entries.push({
        id: message.message_id || `${workspaceId}-${message.sequence_number || index}`,
        question: message.content,
        sql: assistant?.generated_sql || assistant?.content || "",
        messages: [
          {
            id: message.message_id || `${workspaceId}-${index}-user`,
            role: "user",
            content: message.content,
          },
          {
            id: assistant?.message_id || `${workspaceId}-${index}-assistant`,
            role: "assistant",
            content: assistant?.content || assistant?.generated_sql || "",
            sql: assistant?.generated_sql || assistant?.content || "",
          },
        ],
        workspaceId,
        timestamp: message.created_at || new Date().toISOString(),
      });
    }

    if (entries.length === 0) {
      return;
    }

    setHistory((prev) => {
      const otherWorkspaces = prev.filter((item) => item.workspaceId !== workspaceId);
      return [...entries.reverse(), ...otherWorkspaces];
    });
  };

  // Refetch workspaces (call after login)
  const refetchWorkspaces = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setLoading(true);
      const data = await getWorkspaces();
      const workspacesArray = Array.isArray(data) ? data : data.workspaces || [];
      setWorkspaces(workspacesArray);
      if (workspacesArray.length > 0) {
        setCurrentWorkspace(workspacesArray[0]);
      }
    } catch (err) {
      console.error("Failed to refetch workspaces:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        history,
        addHistory,
        loadConversationHistory,
        addWorkspace,
        connectWorkspace,
        updateWorkspaceStatus,
        updateCurrentWorkspace,
        loading,
        error,
        refetchWorkspaces,  // ✅ New function
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
