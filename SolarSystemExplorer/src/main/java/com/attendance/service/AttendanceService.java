package com.attendance.service;

import com.attendance.entity.Attendance;
import java.util.List;

public interface AttendanceService {
    Attendance markAttendance(Attendance attendance);
    List<Attendance> findByClassId(Long classId);
    List<Attendance> findByStudentId(Long studentId);
}
