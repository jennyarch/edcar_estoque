import { AuthAside } from "@/components/auth/auth-aside";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-dvh w-full lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </section>
      <AuthAside />
    </main>
  );
}
