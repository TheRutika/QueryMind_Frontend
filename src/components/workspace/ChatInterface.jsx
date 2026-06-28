import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Clipboard,
  Database,
  Download,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Table,
} from "lucide-react";
import { fetchWorkspaceQuery } from "@/lib/auth";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import { useToast } from "@/hooks/use-toast";

const suggestedQueries = [
  "Show me the tables",
  "Give me a list of orders sorted by date",
  "Show total revenue by product category for completed orders",
  "Find the top 5 customers by total order value",
  "Show each employee, their department name, total sales handled, and number of completed orders",
];

const demoSchema = [
  {
    table: "customers",
    columns: ["customer_id", "customer_name", "city", "signup_date"],
  },
  {
    table: "orders",
    columns: ["order_id", "customer_id", "employee_id", "order_date", "status"],
  },
  {
    table: "order_items",
    columns: ["order_item_id", "order_id", "product_id", "quantity", "unit_price"],
  },
  {
    table: "products",
    columns: ["product_id", "product_name", "category", "price"],
  },
  {
    table: "employees",
    columns: ["employee_id", "full_name", "department_id", "salary", "hired_at"],
  },
  {
    table: "departments",
    columns: ["department_id", "department_name", "location"],
  },
];

const lifecycleSteps = [
  "Extract schema",
  "Generate SQL",
  "Validate SQL",
  "Execute query",
  "Render results",
];

export function ChatInterface({ initialQuery }) {
  const { currentWorkspace, addHistory } = useWorkspace();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState([]);
  const [lastError, setLastError] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [elapsedMs, setElapsedMs] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fields = useMemo(() => {
    if (results.length === 0) {
      return [];
    }
    return Object.keys(results[0]);
  }, [results]);

  useEffect(() => {
    if (!initialQuery) {
      return;
    }

    setQuery(initialQuery.question || initialQuery.english || "");
    setGeneratedSQL(initialQuery.sql || "");
    setResults(initialQuery.results || []);
    setLastError("");
    setActiveStep(-1);
  }, [initialQuery]);

  const formatSQL = (sql) => {
    return sql
      .replace(/\b(FROM|WHERE|SELECT|AND|OR|ORDER BY|GROUP BY|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE)\b/gi, "\n$1")
      .replace(/,/g, ",\n");
  };

  const copySQL = async () => {
    if (!generatedSQL) return;
    await navigator.clipboard.writeText(generatedSQL);
    toast({ title: "Copied", description: "SQL copied to clipboard" });
  };

  const downloadCsv = () => {
    if (results.length === 0) return;

    const escape = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [
      fields.join(","),
      ...results.map((row) => fields.map((field) => escape(row[field])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentWorkspace?.name || "query"}-results.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!query.trim()) return;
    if (!currentWorkspace?.id) {
      toast({
        title: "Error",
        description: "No workspace selected",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedSQL("");
    setResults([]);
    setLastError("");
    setElapsedMs(null);
    setActiveStep(0);
    const startedAt = performance.now();

    try {
      setActiveStep(1);
      // Call backend API to generate SQL from natural language
      const response = await fetchWorkspaceQuery({
        workspaceId: currentWorkspace.id,
        query: query.trim(),
        dbConfig: currentWorkspace.dbConfig, // database configuration
      });

      setActiveStep(3);
      const sql = response.sql_query || response.sql || response.generatedSQL || "";
      const queryResults = response.result?.rows || response.results || [];

      setGeneratedSQL(sql);
      setResults(queryResults);
      setElapsedMs(Math.round(performance.now() - startedAt));
      setActiveStep(4);
      addHistory(query, sql, queryResults); // record to history

      toast({
        title: "Success",
        description: "SQL generated successfully"
      });
    } catch (error) {
      console.error("Query generation error:", error);
      setLastError(error.message || "Failed to generate SQL");
      setElapsedMs(Math.round(performance.now() - startedAt));
      toast({
        title: "Error",
        description: error.message || "Failed to generate SQL",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_320px] gap-4 p-4">
      <div className="min-h-0 overflow-y-auto pr-1 space-y-4">
        <Card className="glass-strong p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Ask QueryMind</h2>
              <p className="text-xs text-gray-400">
                {currentWorkspace?.dbConfig?.database || currentWorkspace?.db_id || "Database"} · {currentWorkspace?.status}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Read-only SQL
            </div>
          </div>

          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask a question for ${currentWorkspace.name}`}
            className="glass min-h-28 border-gray-600 focus:border-purple-500"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedQueries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded border border-gray-700 bg-gray-900/60 px-2.5 py-1 text-xs text-gray-300 hover:border-purple-500 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-auto px-4">
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Working
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Generate SQL
                </>
              )}
            </Button>
            {elapsedMs !== null && (
              <span className="text-xs text-gray-400">{(elapsedMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        </Card>

        {(isGenerating || generatedSQL || lastError) && (
          <Card className="glass-strong p-4">
            <div className="grid grid-cols-5 gap-2">
              {lifecycleSteps.map((step, index) => {
                const done = !lastError && activeStep > index;
                const active = !lastError && activeStep === index;
                return (
                  <div
                    key={step}
                    className={`rounded border px-2 py-2 text-xs ${
                      done
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : active
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-200"
                          : lastError && activeStep <= index
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : "border-gray-700 bg-gray-900/50 text-gray-500"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1">
                      {done ? <CheckCircle className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{index + 1}</span>
                    </div>
                    {step}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {lastError && (
          <Card className="border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
              <div>
                <h3 className="font-semibold text-red-100">Query failed</h3>
                <p className="mt-1 text-sm text-red-200/80">{lastError}</p>
              </div>
            </div>
          </Card>
        )}

        {generatedSQL && (
          <Card className="glass-strong p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white text-lg">Generated SQL</h3>
                <p className="text-xs text-gray-400">
                  {results.length} rows · {fields.length} columns · {currentWorkspace.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copySQL}>
                  <Clipboard className="mr-2 h-4 w-4" /> Copy SQL
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCsv} disabled={results.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </div>

            <pre className="bg-gray-950 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap text-purple-100">
              {formatSQL(generatedSQL)}
            </pre>

            <div className="flex items-center gap-2 text-xs text-green-300">
              <ShieldCheck className="h-4 w-4" />
              Read-only SELECT/WITH validation passed
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-white">Results</h3>
                <span className="text-xs text-gray-400">{results.length} rows returned</span>
              </div>

              {results.length > 0 ? (
                <div className="overflow-x-auto rounded border border-gray-800">
                  <table className="min-w-full text-sm text-white border-collapse">
                    <thead className="bg-gray-900">
                      <tr>
                        {fields.map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-gray-300">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {results.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex} className="hover:bg-gray-900/70">
                          {fields.map((field) => (
                            <td key={field} className="px-3 py-2 text-gray-100">{String(row[field] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-300">
                  Query executed but returned no rows.
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <aside className="min-h-0 overflow-y-auto space-y-4">
        <Card className="glass-strong p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Database className="h-4 w-4 text-purple-300" />
            <h3 className="font-semibold">Workspace</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Database</span>
              <span className="truncate text-gray-100">{currentWorkspace?.dbConfig?.database || currentWorkspace?.db_id || "Unknown"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Service</span>
              <span className="text-gray-100">{currentWorkspace?.dbConfig?.service || "PostgreSQL"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Status</span>
              <span className="text-green-300">{currentWorkspace?.status || "Unknown"}</span>
            </div>
          </div>
        </Card>

        <Card className="glass-strong p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Table className="h-4 w-4 text-purple-300" />
            <h3 className="font-semibold">Schema</h3>
          </div>
          <div className="space-y-3">
            {demoSchema.map((table) => (
              <div key={table.table} className="rounded border border-gray-800 bg-gray-950/50 p-3">
                <div className="mb-2 text-sm font-medium text-white">{table.table}</div>
                <div className="flex flex-wrap gap-1.5">
                  {table.columns.map((column) => (
                    <span key={column} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}
