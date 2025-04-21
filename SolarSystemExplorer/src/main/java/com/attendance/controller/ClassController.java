package com.attendance.controller;

import com.attendance.entity.Class;
import com.attendance.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {
    private final ClassService classService;

    @PostMapping
    public ResponseEntity<Class> createClass(@RequestBody Class class_) {
        return ResponseEntity.ok(classService.createClass(class_));
    }

    @GetMapping
    public ResponseEntity<List<Class>> getClasses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(classService.findAll());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Class>> getClassesByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(classService.findByTeacherId(teacherId));
    }
}
