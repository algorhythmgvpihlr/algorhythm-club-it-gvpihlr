import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEvents } from "@/app/actions/event";
import { getMagazines } from "@/app/actions/magazine";
import { getSettings } from "@/app/actions/settings";
import { Code2, Cpu, Lightbulb, Users, Trophy, Rocket, ArrowRight, Calendar, BookOpen } from "lucide-react";

export default async function HomePage() {
  const [events, magazines, settings] = await Promise.all([
    getEvents(),
    getMagazines(),
    getSettings(),
  ]);

  const upcomingEvents = events.filter(e => e.status === "UPCOMING").slice(0, 3);
  const latestMagazine = magazines[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
        {/* Subtle geometric motif instead of heavy glowing orbs */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-tech-teal/5 to-transparent -z-10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-tech-teal text-sm font-medium mb-8">
            <Cpu size={16} /> GVPIHLR IT Department
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
            ALGORHYTHM CLUB
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {settings.description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/events">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto text-lg h-12 px-8 font-semibold shadow-lg shadow-tech-teal/20">
                Explore Events
              </Button>
            </Link>
            <Link href="/team">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted w-full sm:w-auto text-lg h-12 px-8">
                Meet Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">About AlgoRhythm</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We are a community of passionate developers, designers, and innovators at GVPIHLR. 
            Our mission is to foster a culture of technological excellence, continuous learning, 
            and collaborative problem-solving.
          </p>
          <Link href="/about">
            <Button variant="link" className="text-tech-teal hover:text-tech-teal/80 text-lg gap-2">
              Learn More <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Code2, title: "Coding", desc: "Sharpen your programming skills with our coding sessions." },
              { icon: Cpu, title: "Technology", desc: "Explore the latest in tech, AI, and software engineering." },
              { icon: Lightbulb, title: "Workshops", desc: "Hands-on workshops led by industry experts and alumni." },
              { icon: Trophy, title: "Competitions", desc: "Compete in hackathons and coding challenges." },
              { icon: Rocket, title: "Innovation", desc: "Turn your ideas into reality with collaborative projects." },
              { icon: Users, title: "Community", desc: "Connect with like-minded peers and build your network." },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border hover:border-tech-teal/30 transition-colors shadow-none">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <item.icon className="text-tech-teal" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Upcoming Events</h2>
              <Link href="/events" className="text-tech-teal hover:text-tech-teal/80 font-medium hidden sm:flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="bg-background border-border overflow-hidden group shadow-none">
                  <div className="h-48 bg-muted relative overflow-hidden">
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Calendar size={48} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="text-sm text-tech-teal font-medium mb-2">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{event.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-6">{event.shortOverview}</p>
                    
                    <div className="flex justify-between items-center">
                      <Link href={`/events/${event.slug}`}>
                        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                          Details
                        </Button>
                      </Link>
                      {event.registrationStatus === "OPEN" && event.googleFormUrl ? (
                        <a href={event.googleFormUrl} target="_blank" rel="noreferrer">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Register Now</Button>
                        </a>
                      ) : event.registrationStatus === "CLOSED" ? (
                        <span className="text-muted-foreground font-medium text-sm">Registration Closed</span>
                      ) : (
                        <span className="text-muted-foreground font-medium text-sm">Coming Soon</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/events">
                <Button variant="outline" className="border-border text-foreground w-full">View All Events</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Magazine */}
      {latestMagazine && (
        <section className="py-24 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 shadow-sm">
              <div className="flex-1 space-y-6">
                <div className="inline-block bg-tech-violet/10 text-tech-violet px-3 py-1 rounded-full text-sm font-semibold border border-tech-violet/20">
                  Latest Publication
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground">{latestMagazine.title}</h2>
                <p className="text-xl text-muted-foreground">{latestMagazine.month} {latestMagazine.year}</p>
                <p className="text-muted-foreground max-w-lg">
                  Dive into the latest technical articles, club updates, and alumni interviews in our newest magazine edition.
                </p>
                <div className="pt-4">
                  <a href={latestMagazine.pdfUrl} target="_blank" rel="noreferrer">
                    <Button size="lg" className="bg-tech-violet hover:bg-tech-violet/90 text-white gap-2">
                      <BookOpen size={20} /> Read Magazine
                    </Button>
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-border relative group shadow-sm">
                {latestMagazine.coverImage ? (
                  <img src={latestMagazine.coverImage} alt={latestMagazine.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <BookOpen size={64} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
