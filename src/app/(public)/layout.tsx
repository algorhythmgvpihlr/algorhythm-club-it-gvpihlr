import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSettings } from "@/app/actions/settings";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
