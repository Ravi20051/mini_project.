package com.placement.controller;

import com.placement.entity.Job;
import com.placement.repository.JobRepository;
import com.placement.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.placement.entity.Application;
import com.placement.repository.ApplicationRepository;
import com.placement.security.CustomUserDetails;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai/interview")
public class InterviewController {

    @Autowired
    private AIService aiService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping("/generate/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> generateQuestions(@PathVariable Long jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job not found"));
        }
        Job job = jobOpt.get();
        
        List<String> questions = aiService.generateInterviewQuestions(job.getTitle(), job.getDescription());
        
        Map<String, Object> response = new HashMap<>();
        response.put("questions", questions);
        response.put("jobTitle", job.getTitle());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> evaluateAnswers(@RequestBody Map<String, List<String>> payload) {
        List<String> questions = payload.get("questions");
        List<String> answers = payload.get("answers");

        if (questions == null || answers == null || questions.size() != answers.size()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Questions and answers mismatch"));
        }

        Map<String, Object> evaluation = aiService.evaluateInterview(questions, answers);
        return ResponseEntity.ok(evaluation);
    }

    public static class ChatMessage {
        public String role;
        public String content;
        
        public ChatMessage() {}
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    @PostMapping("/chat/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> chatInterview(@PathVariable Long jobId, @RequestBody List<ChatMessage> history) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job not found"));
        }
        Job job = jobOpt.get();

        String aiResponse = aiService.conductChatInterview(job.getTitle(), job.getDescription(), history);
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }

    @PostMapping("/chat/{jobId}/conclude")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> concludeChatInterview(
            @PathVariable Long jobId, 
            @RequestBody List<ChatMessage> history,
            Authentication auth) {
        
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job not found"));
        }
        Job job = jobOpt.get();

        Map<String, Object> evaluation = aiService.evaluateChatInterview(job.getTitle(), job.getDescription(), history);
        
        // Save to application if exists
        Long studentId = ((CustomUserDetails) auth.getPrincipal()).getId();
        Optional<Application> appOpt = applicationRepository.findByStudentIdAndJobId(studentId, jobId);
        if (appOpt.isPresent()) {
            Application app = appOpt.get();
            app.setInterviewScore((Integer) evaluation.get("score"));
            app.setInterviewFeedback((String) evaluation.get("feedback"));
            applicationRepository.save(app);
        }

        return ResponseEntity.ok(evaluation);
    }
}
