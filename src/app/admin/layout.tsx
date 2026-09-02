import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Muawin — Admin Login",
  description: "Sign in to the Muawin admin dashboard.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
