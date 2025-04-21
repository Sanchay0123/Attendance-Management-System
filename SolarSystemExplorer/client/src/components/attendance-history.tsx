import { useQuery } from "@tanstack/react-query";
import { type Attendance } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface AttendanceHistoryProps {
  showStudentDetails?: boolean;
  showClassDetails?: boolean;
}

export default function AttendanceHistory({
  showStudentDetails = false,
  showClassDetails = false,
}: AttendanceHistoryProps) {
  const { user } = useAuth();

  const { data: attendance, isLoading } = useQuery<Attendance[]>({
    queryKey: [
      user?.role === "student"
        ? "/api/attendance/student"
        : `/api/attendance/class/${showClassDetails ? "all" : user?.id}`,
    ],
  });

  if (isLoading) {
    return <div>Loading attendance history...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            {showStudentDetails && <TableHead>Student</TableHead>}
            {showClassDetails && <TableHead>Class</TableHead>}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance?.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {format(new Date(record.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(record.date), "h:mm a")}
              </TableCell>
              {showStudentDetails && (
                <TableCell>Student {record.studentId}</TableCell>
              )}
              {showClassDetails && (
                <TableCell>Class {record.classId}</TableCell>
              )}
              <TableCell>{record.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
