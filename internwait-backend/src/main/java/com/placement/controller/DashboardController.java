package com.placement.controller;

import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private com.placement.repository.CompanyRepository companyRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private com.placement.service.AIService aiService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication auth) {
        Map<String, Object> stats = new HashMap<>();
        
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        boolean isCompany = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
                
        Long userId = userDetails.getId();

        if (isCompany) {
            String companyName = companyRepository.findById(userId)
                    .map(com.placement.entity.Company::getCompanyName)
                    .orElse("Company");
            stats.put("userName", companyName);
            
            // Generic info for companies
            stats.put("totalJobs", jobRepository.count());
            stats.put("totalStudents", studentRepository.count());
            stats.put("totalApplications", applicationRepository.count());
        } else {
            String studentName = studentRepository.findById(userId)
                    .map(com.placement.entity.Student::getName)
                    .orElse("Student");
            stats.put("userName", studentName);
            
            // Personalized analytics for students
            List<Application> studentApps = applicationRepository.findByStudentId(userId);
            
            long totalApplied = studentApps.size();
            long totalAccepted = studentApps.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count();
            long totalRejected = studentApps.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();

            stats.put("totalJobs", totalApplied); // Used in existing UI
            stats.put("totalStudents", totalAccepted); // Re-purpose for accepted
            stats.put("totalApplications", totalRejected); // Re-purpose for rejected
            
            stats.put("studentTotalApplied", totalApplied);
            stats.put("studentTotalAccepted", totalAccepted);
            stats.put("studentTotalRejected", totalRejected);
            
            long successRate = totalApplied > 0 ? (totalAccepted * 100) / totalApplied : 0;
            stats.put("successRate", successRate);
            
            // Generate a simple dynamic "Weakness Insight" based on rejection reasons or mock
            String commonWeakness = "No rejections yet. Keep applying!";
            if (totalRejected > 0) {
                // Find all rejection reasons
                List<String> reasons = studentApps.stream()
                        .filter(a -> a.getStatus() == ApplicationStatus.REJECTED && a.getRejectionReason() != null)
                        .map(Application::getRejectionReason)
                        .toList();
                
                if (!reasons.isEmpty()) {
                    commonWeakness = "Frequent rejection reason: " + reasons.get(0);
                } else {
                    commonWeakness = "Improve your interview skills or add more projects.";
                }
            }
            stats.put("commonWeakness", commonWeakness);
        }

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recommendations")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getJobRecommendations(Authentication auth) {
        Long studentId = ((CustomUserDetails) auth.getPrincipal()).getId();
        com.placement.entity.Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null || student.getSkills() == null || student.getSkills().isEmpty()) {
            return ResponseEntity.ok("[]");
        }
        
        List<com.placement.entity.Job> jobs = jobRepository.findAll();
        StringBuilder jobsStr = new StringBuilder();
        for (com.placement.entity.Job job : jobs) {
            if ("OPEN".equals(job.getStatus())) {
                String companyName = companyRepository.findById(job.getCompanyId())
                    .map(com.placement.entity.Company::getCompanyName).orElse("Company");
                jobsStr.append(String.format("Job ID: %d, Title: %s, Company: %s, Requires: %s\n", 
                    job.getId(), job.getTitle(), companyName, job.getRequirements()));
            }
        }
        
        String recommendations = aiService.getJobRecommendations(student.getName(), student.getSkills(), jobsStr.toString());
        return ResponseEntity.ok(recommendations);
    }
}
