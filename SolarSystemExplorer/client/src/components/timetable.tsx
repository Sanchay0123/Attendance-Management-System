import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { type Class } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface TimetableProps {
  editable?: boolean;
  showAllClasses?: boolean;
}

export default function Timetable({ editable = false, showAllClasses = false }: TimetableProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();

  const { data: classes, refetch: refetchClasses, error: classesError } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    refetchInterval: 10000, // Refetch every 10 seconds to keep classes updated
    
  });

  const createClassMutation = useMutation({
    mutationFn: async (newClass: Partial<Class>) => {
      const res = await apiRequest("POST", "/api/classes", newClass);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
    },
  });

  const todayClasses = classes?.filter(c => {
    const schedule = JSON.parse(c.schedule);
    return schedule.some((s: any) =>
      format(new Date(s.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
        />

        
        <div className="flex flex-col gap-2">
          <Button onClick={() => refetchClasses()}>
            Refresh Classes
          </Button>
          {!editable && (
            <div className="text-xs text-muted-foreground">
              {classes ? `${classes.length} classes loaded` : 'No classes loaded'}
              {classesError && <div className="text-red-500">Error: {(classesError as Error).message}</div>}
            </div>
          )}
        </div>


        {editable && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createClassMutation.mutate({
                    name: formData.get("name") as string,
                    teacherId: user!.id,
                    room: formData.get("room") as string,
                    schedule: JSON.stringify([{
                      date: selectedDate,
                      startTime: formData.get("startTime"),
                      endTime: formData.get("endTime")
                    }])
                  });
                }}
                className="space-y-4"
              >
                <Input name="name" placeholder="Class Name" required />
                <Input name="room" placeholder="Room Number" required />
                <Input name="startTime" type="time" required />
                <Input name="endTime" type="time" required />
                <Button
                  type="submit"
                  disabled={createClassMutation.isPending}
                >
                  {createClassMutation.isPending ? "Creating..." : "Create Class"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {todayClasses?.map((class_) => (
          <Card key={class_.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{class_.name}</h3>
                  <p className="text-sm text-muted-foreground">Room {class_.room}</p>
                </div>
                {JSON.parse(class_.schedule).map((s: any, i: number) => (
                  <div key={i} className="text-sm">
                    {s.startTime} - {s.endTime}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}