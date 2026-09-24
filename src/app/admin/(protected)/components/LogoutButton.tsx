"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <Button 
      variant={mobile ? "ghost" : "destructive"} 
      size={mobile ? "icon" : "default"}
      className={mobile ? "" : "w-full justify-start text-zinc-100 hover:text-white bg-red-900/50 hover:bg-red-900"}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut size={18} className={mobile ? "" : "mr-2"} />
      {!mobile && "Logout"}
    </Button>
  );
}
