import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-tech-teal to-tech-violet mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
