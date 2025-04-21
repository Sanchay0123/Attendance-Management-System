import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import AttendanceHistory from "@/components/attendance-history";
import QRScanner from "@/components/qr-scanner";
import Timetable from "@/components/timetable";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationDialog from "@/components/notification-dialog";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  // Redirect based on role
  if (user?.role === "teacher") {
    return <Redirect to="/teacher" />;
  } else if (user?.role === "admin") {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
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
              <CardTitle>Scan Attendance QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Timetable />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceHistory />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}