package com.placement.controller;

import com.placement.entity.Company;
import com.placement.entity.Student;
import com.placement.repository.CompanyRepository;
import com.placement.repository.StudentRepository;
import com.placement.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        boolean isCompany = userDetails.getRole().equalsIgnoreCase("COMPANY");
        Long userId = userDetails.getId();

        Map<String, Object> response = new HashMap<>();
        response.put("role", userDetails.getRole());

        if (isCompany) {
            Optional<Company> companyOpt = companyRepository.findById(userId);
            if (companyOpt.isPresent()) {
                Company c = companyOpt.get();
                response.put("name", c.getCompanyName());
                response.put("email", c.getEmail());
                response.put("description", c.getDescription());
                response.put("website", c.getWebsite());
                response.put("industry", c.getIndustry());
            }
        } else {
            Optional<Student> studentOpt = studentRepository.findById(userId);
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                response.put("name", s.getName());
                response.put("email", s.getEmail());
                response.put("branch", s.getBranch());
                response.put("year", s.getYear());
                response.put("githubUrl", s.getGithubUrl());
                response.put("linkedinUrl", s.getLinkedinUrl());
                response.put("portfolioUrl", s.getPortfolioUrl());
                response.put("skills", s.getSkills());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateProfile(Authentication auth, @RequestBody Map<String, String> updates) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        boolean isCompany = userDetails.getRole().equalsIgnoreCase("COMPANY");
        Long userId = userDetails.getId();

        if (isCompany) {
            Optional<Company> companyOpt = companyRepository.findById(userId);
            if (companyOpt.isPresent()) {
                Company c = companyOpt.get();
                if (updates.containsKey("name")) c.setCompanyName(updates.get("name"));
                if (updates.containsKey("description")) c.setDescription(updates.get("description"));
                if (updates.containsKey("website")) c.setWebsite(updates.get("website"));
                if (updates.containsKey("industry")) c.setIndustry(updates.get("industry"));
                
                // Handle Password Update Securely
                if (updates.containsKey("password") && !updates.get("password").trim().isEmpty()) {
                    c.setPassword(passwordEncoder.encode(updates.get("password")));
                }
                
                companyRepository.save(c);
            }
        } else {
            Optional<Student> studentOpt = studentRepository.findById(userId);
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                if (updates.containsKey("name")) s.setName(updates.get("name"));
                if (updates.containsKey("branch")) s.setBranch(updates.get("branch"));
                if (updates.containsKey("year")) s.setYear(updates.get("year"));
                if (updates.containsKey("githubUrl")) s.setGithubUrl(updates.get("githubUrl"));
                if (updates.containsKey("linkedinUrl")) s.setLinkedinUrl(updates.get("linkedinUrl"));
                if (updates.containsKey("portfolioUrl")) s.setPortfolioUrl(updates.get("portfolioUrl"));
                if (updates.containsKey("skills")) s.setSkills(updates.get("skills"));

                // Handle Password Update Securely
                if (updates.containsKey("password") && !updates.get("password").trim().isEmpty()) {
                    s.setPassword(passwordEncoder.encode(updates.get("password")));
                }

                studentRepository.save(s);
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }
}
