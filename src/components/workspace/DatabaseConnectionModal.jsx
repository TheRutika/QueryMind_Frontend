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

export function DatabaseConnectionModal({ open, onClose, onConnect }) {
  const [type, setType] = useState("mysql");
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!host || !username || !database) {
      toast({ title: "Please fill in all required fields." });
      return;
    }
    setLoading(true);
    try {
      const success = await onConnect({
        type,
        host,
        username,
        password,
        database,
      });
      if (success) {
        toast({
          title: "Database Connected",
          description: `Connected to ${type.toUpperCase()} successfully.`,
        });
        onClose();
      }
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: err.message || "Unable to connect.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>Connect Database</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div>
            <Label>Database Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-700 bg-gray-800 text-white px-2 py-1"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
              <option value="Oracle">Oracle</option>
            </select>
          </div>

          <div>
            <Label>Host</Label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div>
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>
          <div>
            <Label>Database Name</Label>
            <Input
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              placeholder="example_db"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleConnect}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     </div>
  );
   
}
