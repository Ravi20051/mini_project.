package com.placement.service;

import com.placement.entity.Job;
import com.placement.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Job job, Long companyId) {
        job.setCompanyId(companyId);
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs(String search, String location, String type) {
        List<Job> jobs = jobRepository.findAll();
        
        return jobs.stream().filter(job -> {
            boolean matchesSearch = search == null || search.isEmpty() || 
                (job.getTitle() != null && job.getTitle().toLowerCase().contains(search.toLowerCase())) ||
                (job.getDescription() != null && job.getDescription().toLowerCase().contains(search.toLowerCase()));
                
            boolean matchesLocation = location == null || location.isEmpty() || 
                (job.getLocation() != null && job.getLocation().toLowerCase().contains(location.toLowerCase()));
                
            boolean matchesType = type == null || type.isEmpty() || 
                (job.getJobType() != null && job.getJobType().equalsIgnoreCase(type));
                
            return matchesSearch && matchesLocation && matchesType;
        }).collect(Collectors.toList());
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }

    public Job updateJob(Long id, Job jobDetails, Long companyId) {
        Optional<Job> opt = jobRepository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Job not found");
        }
        Job existingJob = opt.get();
        if (!existingJob.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized");
        }
        existingJob.setTitle(jobDetails.getTitle());
        existingJob.setDescription(jobDetails.getDescription());
        existingJob.setLocation(jobDetails.getLocation());
        existingJob.setSalary(jobDetails.getSalary());
        existingJob.setRequirements(jobDetails.getRequirements());
        if (jobDetails.getJobType() != null) {
            existingJob.setJobType(jobDetails.getJobType());
        }
        if (jobDetails.getStatus() != null) {
            existingJob.setStatus(jobDetails.getStatus());
        }
        return jobRepository.save(existingJob);
    }

    public void deleteJob(Long id, Long companyId) {
        Optional<Job> opt = jobRepository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Job not found");
        }
        Job existingJob = opt.get();
        if (!existingJob.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized");
        }
        jobRepository.delete(existingJob);
    }
}
