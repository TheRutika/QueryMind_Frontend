import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Sparkles, Zap, Shield } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SIGN IN HANDLER
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const { user, error } = await signIn(email, password);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (user) {
      // ✅ Save user for ProtectedRoute
      localStorage.setItem("currentUser", JSON.stringify(user));

      toast({ title: "Welcome back!", description: "Successfully signed in." });

      // Delay ensures localStorage is set before route check
      setTimeout(() => navigate("/workspace"), 300);
    }

    setIsLoading(false);
  };

  // ✅ SIGN UP HANDLER
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    const { user, error } = await signUp(email, password, name);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (user) {
      // ✅ Save user so ProtectedRoute can verify login
      localStorage.setItem("currentUser", JSON.stringify(user));

      toast({ title: "Account created!", description: "Successfully signed up." });

      // Slight delay for localStorage consistency
      setTimeout(() => navigate("/workspace"), 300);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col gap-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl glass-strong glow">
              <Database className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">QueryMind</h1>
          </div>

          <p className="text-xl text-muted-foreground">
            Transform natural language into powerful SQL queries with AI-powered intelligence
          </p>

          <div className="space-y-4">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "AI-Powered",
                desc: "Natural language to SQL conversion",
              },
              {
                icon: <Zap className="h-6 w-6 text-accent" />,
                title: "Lightning Fast",
                desc: "Instant query generation and validation",
              },
              {
                icon: <Shield className="h-6 w-6 text-primary" />,
                title: "Secure",
                desc: "Enterprise-grade security and privacy",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * i, duration: 0.6 }}
                className="flex items-center gap-4 p-4 glass rounded-xl"
              >
                <div className="p-2 rounded-lg bg-primary/20">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-8 gap-3">
            <div className="p-4 rounded-2xl glass-strong glow">
              <Database className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">QueryMind</h1>
          </div>

          {/* Tabs */}
          <Card className="glass-strong border-border/50 shadow-2xl">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* ✅ SIGN-IN FORM */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full glow">
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* ✅ SIGN-UP FORM */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" type="text" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full glow">
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
