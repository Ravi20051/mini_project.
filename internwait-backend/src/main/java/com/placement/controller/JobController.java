package com.placement.controller;

import com.placement.entity.Job;
import com.placement.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<?> getAllJobs(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "type", required = false) String type) {
        try {
            return ResponseEntity.ok(jobService.getAllJobs(search, location, type));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage() + " | " + e.toString());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable("id") Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/post")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> postJob(@RequestBody Job job, Authentication auth) {
        // Retrieve company ID from JWT claims / CustomUserDetails
        // Extracting from custom user details if provided or passed directly
        // Assuming CustomUserDetails holds the ID
        Long companyId = ((com.placement.security.CustomUserDetails) auth.getPrincipal()).getId();
        Job saved = jobService.createJob(job, companyId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Job>> getCompanyJobs(Authentication auth) {
        Long companyId = ((com.placement.security.CustomUserDetails) auth.getPrincipal()).getId();
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateJob(@PathVariable("id") Long id, @RequestBody Job job, Authentication auth) {
        Long companyId = ((com.placement.security.CustomUserDetails) auth.getPrincipal()).getId();
        Job updatedJob = jobService.updateJob(id, job, companyId);
        return ResponseEntity.ok(updatedJob);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deleteJob(@PathVariable("id") Long id, Authentication auth) {
        Long companyId = ((com.placement.security.CustomUserDetails) auth.getPrincipal()).getId();
        jobService.deleteJob(id, companyId);
        return ResponseEntity.ok(java.util.Map.of("message", "Job deleted successfully"));
    }
}
