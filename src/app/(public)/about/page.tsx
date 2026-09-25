import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, Code2, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | AlgoRhythm Club",
  description: "Learn more about the Technical Club of IT Department, GVPIHLR.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About AlgoRhythm</h1>
        <p className="text-xl text-muted-foreground">The Technical Club of IT Department, GVPIHLR.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        <section className="prose prose-invert prose-lg max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            AlgoRhythm is a vibrant community of aspiring technologists, developers, and designers. 
            Established within the IT Department of GVPIHLR, our club is dedicated to bridging the gap 
            between academic learning and industry-level technical expertise.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We believe that technology is best learned through hands-on collaboration. Whether you are 
            writing your first line of code or deploying complex full-stack architectures, AlgoRhythm 
            provides the environment, resources, and community to accelerate your growth.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8 border-b border-border pb-4">Our Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Code2, title: "Technical Excellence", desc: "Pushing boundaries with modern stacks and best practices." },
              { icon: Users, title: "Community First", desc: "A supportive environment where everyone learns and grows together." },
              { icon: Lightbulb, title: "Innovation", desc: "Building solutions for real-world problems." },
              { icon: TrendingUp, title: "Career Growth", desc: "Preparing members for successful careers in tech." }
            ].map((pillar, i) => (
              <Card key={i} className="bg-card border-border shadow-none hover:border-tech-teal transition-colors duration-300 group">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="mt-1 p-2 bg-muted rounded-md text-tech-teal border border-border group-hover:bg-tech-teal/10 transition-colors duration-300">
                    <pillar.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-tech-teal transition-colors duration-300">{pillar.title}</h3>
                    <p className="text-muted-foreground">{pillar.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
