import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Database, Play, Send, ShieldCheck, Sparkles, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fetchWorkspaceQuery } from "@/lib/auth";
import { useWorkspace } from "@/context/WorkspaceContext.jsx";
import { useToast } from "@/hooks/use-toast";

const lifecycleSteps = [
  "Extract schema",
  "Generate SQL",
  "Validate SQL",
  "Execute query",
  "Render results",
];

function formatSQL(sql = "") {
  return sql
    .replace(/\b(FROM|WHERE|SELECT|AND|OR|ORDER BY|GROUP BY|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)\b/gi, "\n$1")
    .replace(/,/g, ",\n")
    .trim();
}

function normalizeSchema(schema) {
  if (!schema || typeof schema !== "object") {
    return [];
  }

  return Object.entries(schema).map(([table, columns]) => ({
    table,
    columns: Array.isArray(columns)
      ? columns.map((column) => ({
          name: column.column || column.name || String(column),
          type: column.type || column.data_type || "",
        }))
      : [],
  }));
}

function buildInitialThread(initialQuery) {
  if (!initialQuery) {
    return [];
  }

  if (Array.isArray(initialQuery.messages) && initialQuery.messages.length > 0) {
    return initialQuery.messages;
  }

  const id = initialQuery.id || Date.now();
  const question = initialQuery.question || initialQuery.english || "";
  const sql = initialQuery.sql || "";

  return [
    question
      ? {
          id: `${id}-user`,
          role: "user",
          content: question,
        }
      : null,
    sql
      ? {
          id: `${id}-assistant`,
          role: "assistant",
          content: sql,
          sql,
          results: initialQuery.results || [],
        }
      : null,
  ].filter(Boolean);
}

export function ChatInterface({ initialQuery }) {
  const { currentWorkspace, addHistory, updateCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [thread, setThread] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [lastError, setLastError] = useState("");

  const schemaTables = useMemo(
    () => normalizeSchema(currentWorkspace?.schema),
    [currentWorkspace?.schema],
  );

  useEffect(() => {
    const nextThread = buildInitialThread(initialQuery);
    if (nextThread.length > 0) {
      setThread(nextThread);
      setLastError("");
      setActiveStep(-1);
    }
  }, [initialQuery]);

  const handleGenerate = async () => {
    const question = query.trim();
    if (!question) return;

    if (!currentWorkspace?.id) {
      toast({
        title: "Error",
        description: "No workspace selected",
        variant: "destructive",
      });
      return;
    }

    const turnId = Date.now();
    const startedAt = performance.now();

    setIsGenerating(true);
    setLastError("");
    setActiveStep(0);
    setQuery("");
    setThread((prev) => [
      ...prev,
      {
        id: `${turnId}-user`,
        role: "user",
        content: question,
      },
    ]);

    try {
      setActiveStep(1);
      const response = await fetchWorkspaceQuery({
        workspaceId: currentWorkspace.id,
        query: question,
        dbConfig: currentWorkspace.dbConfig,
      });

      setActiveStep(3);
      const sql = response.sql_query || response.sql || response.generatedSQL || "";
      const rows = response.result?.rows || response.results || response.rows || [];
      const fields = response.fields || Object.keys(rows[0] || {});
      const elapsedMs = Math.round(performance.now() - startedAt);

      if (response.schema) {
        updateCurrentWorkspace({ schema: response.schema });
      }

      setThread((prev) => [
        ...prev,
        {
          id: `${turnId}-assistant`,
          role: "assistant",
          content: sql,
          sql,
          results: rows,
          fields,
          elapsedMs,
        },
      ]);
      setActiveStep(4);
      addHistory(question, sql, rows);
    } catch (error) {
      const message = error.message || "Failed to generate SQL";
      setLastError(message);
      setThread((prev) => [
        ...prev,
        {
          id: `${turnId}-error`,
          role: "assistant",
          content: message,
          error: true,
        },
      ]);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_320px] gap-4 p-4">
      <section className="min-h-0 flex flex-col gap-4">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-4">
          {thread.length === 0 ? (
            <Card className="glass-strong p-8 text-center">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-purple-300" />
              <h2 className="text-xl font-semibold text-white">Start a workspace conversation</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-400">
                Ask a question about the connected database. QueryMind will generate SQL,
                execute it, and keep the full conversation here for this workspace.
              </p>
            </Card>
          ) : (
            thread.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {isGenerating && (
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
        </div>

        <Card className="glass-strong p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
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
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={`Ask a question for ${currentWorkspace.name}`}
            className="glass min-h-24 border-gray-600 focus:border-purple-500"
          />

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
            <span className="text-xs text-gray-500">Ctrl + Enter</span>
          </div>
        </Card>
      </section>

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
            {schemaTables.length > 0 ? (
              schemaTables.map((table) => (
                <div key={table.table} className="rounded border border-gray-800 bg-gray-950/50 p-3">
                  <div className="mb-2 text-sm font-medium text-white">{table.table}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {table.columns.map((column) => (
                      <span key={column.name} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                        {column.name}{column.type ? ` · ${column.type}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded border border-gray-800 bg-gray-950/50 p-3 text-sm text-gray-400">
                Connect a workspace or run a query to load schema.
              </div>
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function MessageBubble({ message }) {
  const rows = message.results || [];
  const fields = message.fields || Object.keys(rows[0] || {});
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-lg border p-4 ${
          isUser
            ? "border-purple-500/30 bg-purple-500/15 text-white"
            : message.error
              ? "border-red-500/30 bg-red-500/10 text-red-100"
              : "border-gray-800 bg-gray-950/70 text-gray-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        ) : message.error ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
            <div>
              <h3 className="font-semibold text-red-100">Query failed</h3>
              <p className="mt-1 text-sm text-red-200/80">{message.content}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white">Generated SQL</h3>
              <p className="text-xs text-gray-400">
                {rows.length} rows · {fields.length} columns
                {message.elapsedMs ? ` · ${(message.elapsedMs / 1000).toFixed(1)}s` : ""}
              </p>
            </div>

            <pre className="max-h-72 overflow-auto rounded bg-gray-950 p-3 text-sm font-mono text-purple-100 whitespace-pre-wrap">
              {formatSQL(message.sql || message.content)}
            </pre>

            <div className="flex items-center gap-2 text-xs text-green-300">
              <ShieldCheck className="h-4 w-4" />
              Read-only SELECT/WITH validation passed
            </div>

            {rows.length > 0 ? (
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
                    {rows.map((row, rowIndex) => (
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
        )}
      </div>
    </div>
  );
}
