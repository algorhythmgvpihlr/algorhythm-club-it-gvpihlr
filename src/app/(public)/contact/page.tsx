import { getSettings } from "@/app/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | AlgoRhythm Club",
  description: "Get in touch with the AlgoRhythm Club.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Contact Us</h1>
        <p className="text-xl text-muted-foreground">Have a question or want to collaborate? Reach out to us.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Get In Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-tech-teal border border-border">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Email</h3>
                <a href="mailto:contact@algorhythm.com" className="text-muted-foreground hover:text-tech-teal transition-colors">
                  contact@algorhythm.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-tech-teal border border-border">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Location</h3>
                <p className="text-muted-foreground">
                  IT Department, GVPIHLR<br />
                  Visakhapatnam, Andhra Pradesh
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Connect on Social Media</h3>
              <div className="flex gap-4">
                {settings.whatsappUrl && (
                  <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-tech-teal">
                    WhatsApp Community
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-tech-teal">
                    Instagram
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-tech-teal">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
