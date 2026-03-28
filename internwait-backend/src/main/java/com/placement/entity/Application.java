package com.placement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long jobId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String resumePath;

    private Integer aiMatchScore;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;
    
    private Integer interviewScore;
    
    @Column(columnDefinition = "TEXT")
    private String interviewFeedback;

    private String githubLink;

    private String rejectionReason;

    public Application() {}

    public Application(Long id, Long studentId, Long jobId, ApplicationStatus status) {
        this.id = id;
        this.studentId = studentId;
        this.jobId = jobId;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public Integer getAiMatchScore() { return aiMatchScore; }
    public void setAiMatchScore(Integer aiMatchScore) { this.aiMatchScore = aiMatchScore; }
    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Integer getInterviewScore() { return interviewScore; }
    public void setInterviewScore(Integer interviewScore) { this.interviewScore = interviewScore; }
    public String getInterviewFeedback() { return interviewFeedback; }
    public void setInterviewFeedback(String interviewFeedback) { this.interviewFeedback = interviewFeedback; }
}
