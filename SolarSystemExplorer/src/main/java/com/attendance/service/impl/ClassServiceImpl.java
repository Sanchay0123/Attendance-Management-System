package com.attendance.service.impl;

import com.attendance.entity.Class;
import com.attendance.repository.ClassRepository;
import com.attendance.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {
    private final ClassRepository classRepository;

    @Override
    public Class createClass(Class class_) {
        return classRepository.save(class_);
    }

    @Override
    public Class findById(Long id) {
        return classRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    @Override
    public List<Class> findByTeacherId(Long teacherId) {
        return classRepository.findByTeacherId(teacherId);
    }

    @Override
    public List<Class> findAll() {
        return classRepository.findAll();
    }
}
