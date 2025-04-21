import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/user-management";
import AttendanceHistory from "@/components/attendance-history";
import Timetable from "@/components/timetable";

export default function AdminDashboard() {
  const { logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="destructive" size="icon" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagement />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Global Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceHistory showStudentDetails={true} showClassDetails={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Timetable editable={true} showAllClasses={true} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
