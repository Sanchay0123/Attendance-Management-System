package com.attendance.service;

import com.attendance.entity.Class;
import java.util.List;

public interface ClassService {
    Class createClass(Class class_);
    Class findById(Long id);
    List<Class> findByTeacherId(Long teacherId);
    List<Class> findAll();
}
