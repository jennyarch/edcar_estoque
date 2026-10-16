import type { Metadata } from "next";
import { DashboardCliente } from "@/components/dashboard/dashboard-cliente";

export const metadata: Metadata = {
  title: "Visão geral",
};

export default function DashboardPage() {
  return <DashboardCliente />;
}