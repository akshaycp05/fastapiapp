import { useState } from "react";
import { login } from "../Services/AuthService";

type Props = {
  defaultEmail?: string;
  onLogin: (token: string, name: string, role: string) => void;
  onSwitchToRegister: () => void;
};

function Login({ defaultEmail = "", onLogin, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await login({ email, password });
      onLogin(response.access_token, response.name, response.role);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-sm">
      <div className="w-full max-w-md bg-white p-lg shadow-[0px_12px_32px_rgba(0,0,0,0.08)] border border-outline-variant/20 rounded-xl">
        <div className="mb-lg text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">TalentSpark</h1>
          <p className="text-on-surface-variant text-body-md">Welcome back. Login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="space-y-xs">
            <label className="font-label-md text-[10px] uppercase text-on-surface-variant">Email Address</label>
            <input
              className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-md text-[10px] uppercase text-on-surface-variant">Password</label>
            <input
              className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-3 font-bold rounded shadow-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-body-sm text-on-surface-variant mt-lg mb-2">Don't have an account?</p>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full bg-secondary text-on-secondary py-3 font-bold rounded hover:opacity-90 active:scale-[0.99] transition-all"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;
