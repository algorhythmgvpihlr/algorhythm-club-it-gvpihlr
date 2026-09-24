import { getMagazines, deleteMagazine } from "@/app/actions/magazine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileText } from "lucide-react";
import { MagazineForm } from "./MagazineForm";

export default async function AdminMagazinesPage() {
  const magazines = await getMagazines();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Magazine Management</h1>
          <p className="text-muted-foreground">Manage club publications and newsletters.</p>
        </div>
        <MagazineForm />
      </div>

      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Magazines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Issue</TableHead>
                  <TableHead className="text-muted-foreground">PDF</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {magazines.length === 0 ? (
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No magazines found.
                    </TableCell>
                  </TableRow>
                ) : (
                  magazines.map((mag) => (
                    <TableRow key={mag.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{mag.title}</TableCell>
                      <TableCell className="text-muted-foreground">{mag.month} {mag.year}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <a href={mag.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-tech-teal hover:underline font-medium">
                          <FileText size={16} /> View PDF
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <MagazineForm magazine={mag} />
                          <form action={async () => {
                            "use server";
                            await deleteMagazine(mag.id);
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 size={16} />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
