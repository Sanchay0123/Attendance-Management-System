package com.attendance.repository;

import com.attendance.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassRepository extends JpaRepository<Class, Long> {
    List<Class> findByTeacherId(Long teacherId);
}
