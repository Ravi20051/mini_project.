package com.placement.controller;

import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.service.ApplicationService;
import com.placement.service.JobService;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.repository.StudentRepository;
import com.placement.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private JobService jobService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private com.placement.repository.ApplicationRepository applicationRepository;

    @GetMapping("/applications/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentApplicationsWithJobs(Authentication auth) {
        Long studentId = ((CustomUserDetails) auth.getPrincipal()).getId();
        List<Application> apps = applicationService.getStudentApplications(studentId);
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        for (Application app : apps) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("applicationId", app.getId());
            map.put("status", app.getStatus());
            map.put("appliedAt", app.getId()); // using id as fallback for date
            map.put("aiMatchScore", app.getAiMatchScore());
            map.put("aiFeedback", app.getAiFeedback());
            map.put("interviewScore", app.getInterviewScore());
            map.put("interviewFeedback", app.getInterviewFeedback());
            map.put("githubLink", app.getGithubLink());
            map.put("rejectionReason", app.getRejectionReason());
            if (app.getResumePath() != null) {
                map.put("resumeFilename", new java.io.File(app.getResumePath()).getName());
            }
            
            Job job = jobService.getJobById(app.getJobId()).orElse(null);
            map.put("job", job);
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/applications/apply/{jobId}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(
            @PathVariable("jobId") Long jobId,
            @RequestParam(value = "resume", required = false) org.springframework.web.multipart.MultipartFile resume,
            @RequestParam(value = "githubLink", required = false) String githubLink,
            Authentication auth) {
        try {
            Long studentId = ((CustomUserDetails) auth.getPrincipal()).getId();
            Application app = applicationService.applyForJob(studentId, jobId, resume, githubLink);
            return ResponseEntity.ok(Map.of("message", "Application successful", "applicationId", app.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications/resume/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getResume(@PathVariable String filename) {
        try {
            java.nio.file.Path file = java.nio.file.Paths.get("uploads/resumes/").resolve(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/company/applications/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Map<String, Object>>> getJobApplications(@PathVariable("jobId") Long jobId) {
        List<Application> apps = applicationService.getCompanyApplications(jobId);
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        for (Application app : apps) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("applicationId", app.getId());
            map.put("status", app.getStatus());
            map.put("appliedAt", app.getId());
            map.put("aiMatchScore", app.getAiMatchScore());
            map.put("aiFeedback", app.getAiFeedback());
            map.put("interviewScore", app.getInterviewScore());
            map.put("interviewFeedback", app.getInterviewFeedback());
            map.put("githubLink", app.getGithubLink());
            map.put("rejectionReason", app.getRejectionReason());
            if (app.getResumePath() != null) {
                map.put("resumeFilename", new java.io.File(app.getResumePath()).getName());
            }
            
            Student student = studentRepository.findById(app.getStudentId()).orElse(null);
            if (student != null) {
                map.put("studentName", student.getName());
                map.put("studentEmail", student.getEmail());
                map.put("studentBranch", student.getBranch());
                map.put("studentYear", student.getYear());
                map.put("studentSkills", student.getSkills());
                map.put("studentLinkedin", student.getLinkedinUrl());
                map.put("studentPortfolio", student.getPortfolioUrl());
            } else {
                map.put("studentName", "Unknown");
                map.put("studentEmail", "");
                map.put("studentBranch", "");
                map.put("studentYear", "");
                map.put("studentSkills", "");
                map.put("studentLinkedin", "");
                map.put("studentPortfolio", "");
            }
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/company/application/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        ApplicationStatus status = ApplicationStatus.valueOf(body.get("status").toUpperCase());
        String reason = body.getOrDefault("reason", null);
        Application updated = applicationService.updateApplicationStatus(id, status, reason);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/company/applications/{jobId}/export")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<byte[]> exportApplicationsToCSV(@PathVariable Long jobId) {
        List<Application> apps = applicationRepository.findByJobId(jobId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Application_ID,Student_Name,Email,Branch,Status,Match_Score,AI_Feedback,Interview_Score,Interview_Feedback,Github_Link\n");
        
        for (Application app : apps) {
            Student student = studentRepository.findById(app.getStudentId()).orElse(null);
            String name = student != null ? student.getName() : "Unknown";
            String email = student != null ? student.getEmail() : "Unknown";
            String branch = student != null ? student.getBranch() : "Unknown";
            
            csv.append(app.getId()).append(",")
               .append(escapeCsv(name)).append(",")
               .append(escapeCsv(email)).append(",")
               .append(escapeCsv(branch)).append(",")
               .append(app.getStatus()).append(",")
               .append(app.getAiMatchScore() != null ? app.getAiMatchScore() + "%" : "N/A").append(",")
               .append(escapeCsv(app.getAiFeedback() != null ? app.getAiFeedback() : "")).append(",")
               .append(app.getInterviewScore() != null ? app.getInterviewScore() + "%" : "N/A").append(",")
               .append(escapeCsv(app.getInterviewFeedback() != null ? app.getInterviewFeedback() : "")).append(",")
               .append(escapeCsv(app.getGithubLink() != null ? app.getGithubLink() : ""))
               .append("\n");
        }
        
        byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"applicants_job_" + jobId + ".csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    
    private String escapeCsv(String data) {
        if (data == null) return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
