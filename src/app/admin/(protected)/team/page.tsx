import { getTeamMembers, deleteTeamMember } from "@/app/actions/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TeamForm } from "./TeamForm";

export default async function AdminTeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage board members, volunteers, and faculty.</p>
        </div>
        <TeamForm />
      </div>

      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Position</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Year</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{member.name}</TableCell>
                      <TableCell className="text-muted-foreground">{member.position}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          {member.category.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.academicYear || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TeamForm member={member} />
                          <form action={async () => {
                            "use server";
                            await deleteTeamMember(member.id);
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
