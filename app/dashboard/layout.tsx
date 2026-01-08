"use client";

import { ReactNode } from "react";
import { CustomLayout } from "@/components/custom-layout";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CustomLayout>
      <Header />
      {children}
    </CustomLayout>
  );
}
