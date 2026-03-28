package com.placement.controller;

import com.placement.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test-email")
    public String testEmail(@RequestParam String to) {
        StringBuilder report = new StringBuilder();
        
        // 1. DNS Check
        try {
            java.net.InetAddress[] addresses = java.net.InetAddress.getAllByName("smtp.gmail.com");
            report.append("DNS SUCCESS: Resolved smtp.gmail.com to: ");
            for (java.net.InetAddress addr : addresses) report.append(addr.getHostAddress()).append(" ");
            report.append("\n\n");
        } catch (Exception e) {
            report.append("DNS FAILURE: Could not resolve smtp.gmail.com: ").append(e.getMessage()).append("\n\n");
        }

        // 2. Raw Socket Check (Port 587)
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("smtp.gmail.com", 587), 5000);
            report.append("NETWORK SUCCESS: Connected to smtp.gmail.com on port 587\n\n");
        } catch (Exception e) {
            report.append("NETWORK FAILURE: Port 587 blocked or timed out: ").append(e.getMessage()).append("\n\n");
        }

        // 3. SMTP Test
        boolean success = emailService.testConnectivity(to);
        if (success) {
            report.append("SUCCESS: Test email successfully sent to ").append(to);
        } else {
            report.append("FAILURE: Email sending failed. Check logs for SMTP DEBUG trace.");
        }
        
        return report.toString();
    }

    @GetMapping("/test-acceptance")
    public String testAcceptanceEmail(@RequestParam String to) {
        try {
            emailService.sendStatusUpdateEmail(
                to,
                "Test Student",
                "Test Company",
                "Software Engineer Demo",
                "ACCEPTED",
                null
            );
            return "SUCCESS: Acceptance email sent to " + to + " without any Java exceptions.";
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return "FAILURE: Exception caught while sending acceptance email:\n\n" + e.getMessage() + "\n\nStacktrace:\n" + sw.toString();
        }
    }
}
