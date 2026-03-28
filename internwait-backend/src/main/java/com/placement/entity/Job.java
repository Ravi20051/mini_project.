package com.placement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String location;
    
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "job_type")
    private String jobType = "Full-time";

    @Column(nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String status = "OPEN";

    public Job() {}

    public Job(Long id, String title, String description, String location, String salary, String requirements, Long companyId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.salary = salary;
        this.requirements = requirements;
        this.companyId = companyId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public String getJobType() { return jobType != null ? jobType : "Full-time"; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
