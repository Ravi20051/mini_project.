package com.placement.service;

import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.CompanyRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AIService aiService;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private CompanyRepository companyRepository;

    // Directory to save uploaded resumes
    private final String UPLOAD_DIR = "uploads/resumes/";

    public Application applyForJob(Long studentId, Long jobId, MultipartFile resume, String githubLink) {
        if (applicationRepository.existsByStudentIdAndJobId(studentId, jobId)) {
            throw new RuntimeException("Already applied for this job");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Application app = new Application();
        app.setStudentId(studentId);
        app.setJobId(jobId);
        app.setStatus(ApplicationStatus.APPLIED);
        app.setGithubLink(githubLink);

        if (resume != null && !resume.isEmpty()) {
            try {
                // Save the file locally
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String filename = System.currentTimeMillis() + "_" + resume.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR, filename);
                Files.write(filePath, resume.getBytes());
                app.setResumePath(filePath.toString());

                // Extract Text from PDF
                String resumeText = extractTextFromPdf(filePath.toFile());

                // Analyze with AI using the Job Details
                AIService.AIResult aiResult = aiService.analyzeResume(resumeText, job.getDescription(), job.getRequirements());
                app.setAiMatchScore(aiResult.matchScore);
                app.setAiFeedback(aiResult.feedback);

            } catch (Exception e) {
                System.err.println("Failed to process resume: " + e.getMessage());
                // Non-blocking error, application still succeeds without AI analysis
                app.setAiMatchScore(0);
                app.setAiFeedback("Failed to process resume: " + e.getMessage());
            }
        }

        return applicationRepository.save(app);
    }

    private String extractTextFromPdf(File pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public List<Application> getCompanyApplications(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getStudentApplications(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public Application updateApplicationStatus(Long id, ApplicationStatus status, String rejectionReason) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        if (rejectionReason != null) {
            app.setRejectionReason(rejectionReason);
        }
        
        Application saved = applicationRepository.save(app);
        
        // Trigger Email Notification Asynchronously
        if (status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.REJECTED) {
            new Thread(() -> {
                try {
                    Student student = studentRepository.findById(saved.getStudentId()).orElse(null);
                    Job job = jobRepository.findById(saved.getJobId()).orElse(null);
                    if (student != null && job != null) {
                        com.placement.entity.Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
                        String companyName = company != null ? company.getCompanyName() : "Company";
                        emailService.sendStatusUpdateEmail(
                            student.getEmail(),
                            student.getName(),
                            companyName,
                            job.getTitle(),
                            status.name(),
                            rejectionReason
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to trigger email asynchronously.");
                    e.printStackTrace();
                }
            }).start();
        }
        
        return saved;
    }
}
