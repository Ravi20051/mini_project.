package com.placement.service;

import com.placement.entity.Admin;
import com.placement.entity.Company;
import com.placement.entity.Student;
import com.placement.repository.AdminRepository;
import com.placement.repository.CompanyRepository;
import com.placement.repository.StudentRepository;
import com.placement.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public Student registerStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepository.save(student);
    }

    public Company registerCompany(Company company) {
        if (companyRepository.existsByEmail(company.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        company.setPassword(passwordEncoder.encode(company.getPassword()));
        return companyRepository.save(company);
    }

    public Map<String, String> loginStudent(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        Student student = studentRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(student.getEmail(), "STUDENT", student.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("name", student.getName());
        response.put("role", "STUDENT");
        return response;
    }

    public Map<String, String> loginCompany(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        Company company = companyRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(company.getEmail(), "COMPANY", company.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("name", company.getCompanyName());
        response.put("role", "COMPANY");
        return response;
    }

    public Map<String, String> loginAdmin(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        Admin admin = adminRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("name", admin.getName());
        response.put("role", "ADMIN");
        return response;
    }
}
