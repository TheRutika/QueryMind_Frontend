import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CheckCircle,
  Cloud,
  Code2,
  Database,
  FileText,
  History,
  Lock,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const workflow = [
  { icon: Database, label: "Schema extracted", detail: "Tables and columns stay grounded" },
  { icon: Sparkles, label: "SQL generated", detail: "Natural language becomes read-only SQL" },
  { icon: ShieldCheck, label: "Query validated", detail: "Unsafe statements are rejected" },
  { icon: Table2, label: "Results rendered", detail: "Rows, fields, history, and CSV export" },
];

const capabilities = [
  {
    icon: Server,
    title: "Local database execution",
    text: "Credentials, query execution, and conversation history remain in the local backend.",
  },
  {
    icon: Cloud,
    title: "Cloud AI routing",
    text: "The cloud backend authenticates users and routes each request to the correct AI service.",
  },
  {
    icon: Boxes,
    title: "Per-user containers",
    text: "Docker Swarm keeps each user's inference runtime isolated and restartable.",
  },
  {
    icon: Lock,
    title: "Read-only guardrails",
    text: "Generated SQL is constrained to SELECT/WITH workflows before execution.",
  },
  {
    icon: History,
    title: "Workspace memory",
    text: "Queries, generated SQL, and result metadata are preserved for repeat analysis.",
  },
  {
    icon: FileText,
    title: "Research-ready trace",
    text: "Every step is visible: schema, prompt, SQL, validation, execution, and result.",
  },
];

const sampleRows = [
  { customer: "Aarav Foods", orders: 4, revenue: "₹42,850" },
  { customer: "Neon Retail", orders: 3, revenue: "₹31,420" },
  { customer: "BluePeak Labs", orders: 2, revenue: "₹18,700" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.08),rgba(168,85,247,0.12),rgba(16,185,129,0.08))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-20px)] max-w-7xl grid-cols-1 gap-10 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <Database className="h-4 w-4" />
              QueryMind
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            >
              Ask your database questions in plain English.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              QueryMind converts natural language into validated SQL, executes it on your local
              database, and routes AI inference through isolated cloud containers.
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/auth")}
                className="h-12 rounded-md bg-cyan-400 px-5 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Open Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="h-12 rounded-md border-white/20 bg-white/5 px-5 text-white hover:bg-white/10"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Demo Query
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["SELECT/WITH", "guarded SQL"],
                ["Per-user", "AI services"],
                ["Local", "data execution"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-sm font-semibold text-white">{value}</div>
                  <div className="mt-1 text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex items-center"
          >
            <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-950/30">
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Code2 className="h-4 w-4 text-cyan-300" />
                  Workspace · sample_db
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Container online
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_240px]">
                <div className="p-4">
                  <div className="rounded-md border border-white/10 bg-slate-900/80 p-4">
                    <div className="mb-3 text-xs uppercase text-slate-500">Natural language</div>
                    <div className="rounded border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-sm text-cyan-50">
                      Show top customers by completed order value
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {workflow.map((step, index) => (
                      <div key={step.label} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                        <step.icon className="mb-2 h-4 w-4 text-cyan-300" />
                        <div className="text-xs font-medium text-white">{index + 1}. {step.label}</div>
                        <div className="mt-1 text-[11px] leading-4 text-slate-500">{step.detail}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-md border border-white/10 bg-slate-900/80 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs uppercase text-slate-500">Generated SQL</span>
                      <span className="flex items-center gap-1 text-xs text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        read-only verified
                      </span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-purple-100">
{`SELECT c.customer_name,
       SUM(oi.quantity * oi.unit_price) AS total_value
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
WHERE LOWER(o.status) = 'completed'
GROUP BY c.customer_name
ORDER BY total_value DESC;`}
                    </pre>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-md border border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Customer</th>
                          <th className="px-3 py-2">Orders</th>
                          <th className="px-3 py-2">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 bg-slate-950">
                        {sampleRows.map((row) => (
                          <tr key={row.customer}>
                            <td className="px-3 py-2 text-slate-100">{row.customer}</td>
                            <td className="px-3 py-2 text-slate-300">{row.orders}</td>
                            <td className="px-3 py-2 text-emerald-300">{row.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-slate-900/50 p-4 lg:border-l lg:border-t-0">
                  <div className="mb-3 text-xs uppercase text-slate-500">Schema context</div>
                  {["customers", "orders", "order_items", "products"].map((table) => (
                    <div key={table} className="mb-2 rounded border border-white/10 bg-slate-950/70 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-slate-100">
                        <Table2 className="h-3.5 w-3.5 text-cyan-300" />
                        {table}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold">Built for a real NL-to-SQL workflow</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              The interface exposes the parts that matter in a research demo: schema grounding,
              model routing, safe SQL, execution results, and history.
            </p>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="h-11 rounded-md bg-white text-slate-950 hover:bg-slate-200"
          >
            Start Querying
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => (
            <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <item.icon className="mb-4 h-6 w-6 text-cyan-300" />
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-white/10 bg-slate-950 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Frontend", "React workspace console"],
              ["Local backend", "schema, execution, history"],
              ["Cloud backend", "auth and container routing"],
              ["AI container", "Ollama model per user"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-white/10 bg-slate-900/70 p-4">
                <CheckCircle className="mb-3 h-5 w-5 text-emerald-300" />
                <div className="font-medium">{title}</div>
                <div className="mt-1 text-sm text-slate-400">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
