import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-lg shadow-brand/30">
            饮
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Zap Thoung Café</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to the POS console</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/30">
          Feel the Taste of Royality
        </p>
      </div>
    </div>
  );
}
