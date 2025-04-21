import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRGenerator from "@/components/qr-generator";
import Timetable from "@/components/timetable";
import AttendanceHistory from "@/components/attendance-history";
import { useQuery } from "@tanstack/react-query";
import { type Class } from "@shared/schema";
import NotificationDialog from "@/components/notification-dialog";

export default function TeacherDashboard() {
  const { logoutMutation } = useAuth();

  const { data: classes } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationDialog />
            <Button variant="destructive" size="icon" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Generate Attendance QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <QRGenerator classes={classes || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Timetable editable={true} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceHistory showStudentDetails={true} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}