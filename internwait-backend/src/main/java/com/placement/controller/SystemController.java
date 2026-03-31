package com.placement.controller;

import com.placement.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${keepalive.secret.key:my_super_secret_key_123}")
    private String secretKey;

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

    @GetMapping("/keep-alive")
    public ResponseEntity<String> keepAlive(@RequestHeader(value = "X-Keep-Alive-Key", required = false) String providedKey) {
        // 1. Verify the key to ensure only you/your cron job can hit this
        if (providedKey == null || !providedKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        // 2. Ping the database to keep Aiven awake
        try {
            jdbcTemplate.execute("SELECT 1");
            return ResponseEntity.ok("Server and Database are awake! 🚀");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database ping failed: " + e.getMessage());
        }
    }
}
