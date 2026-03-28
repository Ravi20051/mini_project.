package com.placement.config;

import com.placement.entity.Admin;
import com.placement.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Automatically create a default TPO Admin if none exists
        if (adminRepository.findByEmail("admin@college.edu").isEmpty()) {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setEmail("admin@college.edu");
            defaultAdmin.setPassword(passwordEncoder.encode("admin123"));
            defaultAdmin.setName("Placement Officer Head");
            adminRepository.save(defaultAdmin);
            System.out.println("✅ Default Admin Created: admin@college.edu / admin123");
        }
    }
}
