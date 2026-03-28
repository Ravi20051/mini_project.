package com.placement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.api.url}")
    private String brevoApiUrl;

    @Value("${app.mail.sender}")
    private String senderEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendStatusUpdateEmail(String toEmail, String studentName, String companyName, String jobTitle, String status, String reason) {
        String subject = "Application Update: " + companyName + " - " + jobTitle;
        
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(studentName).append(",<br><br>");
        body.append("This is an automated update regarding your application for the <b>").append(jobTitle).append("</b> position at <b>").append(companyName).append("</b>.<br><br>");
        
        if (status.equalsIgnoreCase("ACCEPTED")) {
            body.append("<span style='color: green;'>Congratulations! We are thrilled to inform you that you have been SHORTLISTED/ACCEPTED for the next round.</span><br>");
            body.append("The HR team will reach out to you shortly with further details.<br>");
        } else if (status.equalsIgnoreCase("REJECTED")) {
            body.append("We appreciate your interest in joining our team. Unfortunately, we will not be moving forward with your application at this time.<br><br>");
            if (reason != null && !reason.trim().isEmpty()) {
                body.append("Feedback from our review team:<br><i>\"").append(reason).append("\"</i><br><br>");
            }
            body.append("We encourage you to use this feedback and apply to future openings.<br>");
        } else {
            body.append("Your application status has been updated to: ").append(status).append(".<br>");
        }
        
        body.append("<br>Best regards,<br><b>").append(companyName).append("</b> Recruitment Team via Internwait Platform");

        sendEmailViaBrevo(toEmail, studentName, subject, body.toString());
    }

    public boolean testConnectivity(String toEmail) {
        String subject = "Internwait Brevo API Test";
        String body = "This is a test email to verify Brevo API configuration on Render.<br><br>Sender: " + senderEmail;
        try {
            sendEmailViaBrevo(toEmail, "Test User", subject, body);
            return true;
        } catch (Exception e) {
            System.err.println("Brevo Test Failed: " + e.getMessage());
            return false;
        }
    }

    private void sendEmailViaBrevo(String toEmail, String toName, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            System.out.println("DEBUG: Brevo API key is not configured. Skipping email to " + toEmail);
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.set("accept", "application/json");

        Map<String, Object> body = new HashMap<>();
        
        Map<String, String> sender = new HashMap<>();
        sender.put("email", senderEmail);
        sender.put("name", "Internwait System");
        body.put("sender", sender);

        List<Map<String, String>> toList = new ArrayList<>();
        Map<String, String> to = new HashMap<>();
        to.put("email", toEmail);
        if (toName != null) {
            to.put("name", toName);
        }
        toList.add(to);
        body.put("to", toList);

        body.put("subject", subject);
        body.put("htmlContent", htmlContent);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(brevoApiUrl, HttpMethod.POST, entity, String.class);
            System.out.println("DEBUG: Email successfully sent via Brevo API to " + toEmail + ". Response: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Failed to send email via Brevo to " + toEmail + " from " + senderEmail);
            System.err.println("Error details: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email via API to " + toEmail + ": " + e.getMessage(), e);
        }
    }
}
