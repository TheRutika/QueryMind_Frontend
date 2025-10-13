import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";

export function ChatInterface() {
  const { currentWorkspace, addHistory } = useWorkspace();
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatSQL = (sql) => {
    return sql
      .replace(/\b(FROM|WHERE|SELECT|AND|OR|ORDER BY|GROUP BY|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE)\b/gi, "\n$1")
      .replace(/,/g, ",\n");
  };

  const handleGenerate = () => {
    if (!query.trim()) return;

    setIsGenerating(true);

    // Simulate AI generating SQL
    setTimeout(() => {
      const mockSQL = `SELECT * FROM users WHERE name LIKE '%${query}%'`;
      const mockResults = [
        { id: 1, name: "Alice", last_login: "2023-03-15" },
        { id: 2, name: "Bob", last_login: "2023-02-20" },
      ];

      setGeneratedSQL(mockSQL);
      setResults(mockResults);
      addHistory(query, mockSQL); // record to history
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6">
      {/* Query Input */}
      <Card className="glass-strong p-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask a question for ${currentWorkspace.name}`}
          className="glass border-gray-600 focus:border-purple-500"
        />
        <Button onClick={handleGenerate}  className="mt-2 w-auto px-4">
          {isGenerating ? "Generating..." : <><Send className="mr-2" /> Generate SQL</>}
        </Button>
      </Card>

      {/* Generated SQL and Results */}
      {generatedSQL && (
        <Card className="glass-strong p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white text-lg">Generated SQL</h3>
            <span className="text-sm text-gray-400">{currentWorkspace.name}</span>
          </div>

          <pre className="bg-gray-900 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
            {formatSQL(generatedSQL)}
          </pre>

          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white border-collapse">
                <thead className="bg-gray-800">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-3 py-2 text-left text-gray-300">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {results.map((row) => (
                    <tr key={row.id}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-3 py-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
