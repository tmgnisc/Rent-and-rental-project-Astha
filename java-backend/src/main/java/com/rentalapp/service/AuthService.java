package com.rentalapp.service;

import com.rentalapp.dto.LoginRequest;
import com.rentalapp.dto.RegisterRequest;
import com.rentalapp.dto.UserDTO;
import com.rentalapp.exception.BadRequestException;
import com.rentalapp.exception.ResourceNotFoundException;
import com.rentalapp.model.User;
import com.rentalapp.repository.UserRepository;
import com.rentalapp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        // Set role
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("VENDOR")) {
            user.setRole(User.UserRole.VENDOR);
        } else {
            user.setRole(User.UserRole.CUSTOMER);
        }

        User savedUser = userRepository.save(user);
        return userService.getUserById(savedUser.getId());
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        return jwtTokenProvider.generateToken(user);
    }

    public UserDTO getCurrentUser(String userId) {
        return userService.getUserById(userId);
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

