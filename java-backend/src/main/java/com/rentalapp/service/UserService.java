package com.rentalapp.service;

import com.rentalapp.dto.UserDTO;
import com.rentalapp.exception.ResourceNotFoundException;
import com.rentalapp.model.User;
import com.rentalapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getPendingVendorVerifications() {
        return userRepository.findByVerificationStatus(User.VerificationStatus.PENDING).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getPendingKycVerifications() {
        return userRepository.findByKycStatus(User.KycStatus.PENDING).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public UserDTO updateUser(String id, User updatedUser) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (updatedUser.getName() != null) user.setName(updatedUser.getName());
        if (updatedUser.getProfileImage() != null) user.setProfileImage(updatedUser.getProfileImage());
        
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    public UserDTO updateVerificationStatus(String id, User.VerificationStatus status, String verifiedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setVerificationStatus(status);
        user.setDocumentVerifiedBy(verifiedBy);
        if (status == User.VerificationStatus.APPROVED) {
            user.setIsVerified(true);
        }
        
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    public UserDTO updateKycStatus(String id, User.KycStatus status, String verifiedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setKycStatus(status);
        user.setKycVerifiedBy(verifiedBy);
        
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setIsVerified(user.getIsVerified());
        dto.setVendorDocumentUrl(user.getVendorDocumentUrl());
        dto.setVerificationStatus(user.getVerificationStatus().name());
        dto.setDocumentVerifiedBy(user.getDocumentVerifiedBy());
        dto.setKycDocumentUrl(user.getKycDocumentUrl());
        dto.setKycStatus(user.getKycStatus().name());
        dto.setKycVerifiedBy(user.getKycVerifiedBy());
        dto.setProfileImage(user.getProfileImage());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}

