import { createContext, useContext, useState, useEffect } from "react";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: "Default Workspace", status: "connected" },
    { id: 2, name: "Analytics", status: "connected" },
  ]);

  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("queryHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(history));
  }, [history]);

  // Add new workspace
  const addWorkspace = (workspace) => {
    const exists = workspaces.find((ws) => ws.name === workspace.name);
    if (exists) return;

    const newWorkspace = {
      id: Date.now(),
      name: workspace.name,
      status: "pending",
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
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

  // Add query to history
  const addHistory = (question, sql) => {
    if (!currentWorkspace) return;
    const newEntry = {
      id: Date.now(),
      question,
      sql,
      workspaceId: currentWorkspace.id,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        history,
        addHistory,
        addWorkspace,
        updateWorkspaceStatus,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
