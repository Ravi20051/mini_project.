package com.placement.controller;

import com.placement.entity.Company;
import com.placement.entity.Student;
import com.placement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/student/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        Student saved = authService.registerStudent(student);
        return ResponseEntity.ok(Map.of("message", "Student registered successfully", "id", saved.getId()));
    }

    @PostMapping("/company/register")
    public ResponseEntity<?> registerCompany(@RequestBody Company company) {
        Company saved = authService.registerCompany(company);
        return ResponseEntity.ok(Map.of("message", "Company registered successfully", "id", saved.getId()));
    }

    @PostMapping("/student/login")
    public ResponseEntity<?> loginStudent(@RequestBody Map<String, String> credentials) {
        Map<String, String> response = authService.loginStudent(credentials.get("email"), credentials.get("password"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/company/login")
    public ResponseEntity<?> loginCompany(@RequestBody Map<String, String> credentials) {
        Map<String, String> response = authService.loginCompany(credentials.get("email"), credentials.get("password"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        Map<String, String> response = authService.loginAdmin(credentials.get("email"), credentials.get("password"));
        return ResponseEntity.ok(response);
    }
}
