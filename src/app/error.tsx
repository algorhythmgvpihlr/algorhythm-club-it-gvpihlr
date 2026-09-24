"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center p-8 bg-card border border-border rounded-xl shadow-none max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred while processing your request.
        </p>
        <Button 
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
