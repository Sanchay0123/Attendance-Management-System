package com.attendance.service;

import com.attendance.entity.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User findByUsername(String username);
    User findById(Long id);
    List<User> findAll();
    boolean existsByUsername(String username);
}
