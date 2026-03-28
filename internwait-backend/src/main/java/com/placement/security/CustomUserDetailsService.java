package com.placement.security;

import com.placement.entity.Admin;
import com.placement.entity.Company;
import com.placement.entity.Student;
import com.placement.repository.AdminRepository;
import com.placement.repository.CompanyRepository;
import com.placement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try finding as Student
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            return new CustomUserDetails(s.getId(), s.getEmail(), s.getPassword(), "STUDENT");
        }

        // Try finding as Company
        Optional<Company> companyOpt = companyRepository.findByEmail(email);
        if (companyOpt.isPresent()) {
            Company c = companyOpt.get();
            return new CustomUserDetails(c.getId(), c.getEmail(), c.getPassword(), "COMPANY");
        }

        // Try finding as Admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin a = adminOpt.get();
            return new CustomUserDetails(a.getId(), a.getEmail(), a.getPassword(), "ADMIN");
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
