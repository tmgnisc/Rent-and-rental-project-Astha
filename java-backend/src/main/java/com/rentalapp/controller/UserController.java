package com.rentalapp.controller;

import com.rentalapp.dto.ApiResponse;
import com.rentalapp.dto.UserDTO;
import com.rentalapp.model.User;
import com.rentalapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    @GetMapping("/vendors")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getVendors() {
        List<UserDTO> vendors = userService.getUsersByRole(User.UserRole.VENDOR);
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved", vendors));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getCustomers() {
        List<UserDTO> customers = userService.getUsersByRole(User.UserRole.CUSTOMER);
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }

    @GetMapping("/pending-verifications")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getPendingVerifications() {
        List<UserDTO> users = userService.getPendingVendorVerifications();
        return ResponseEntity.ok(ApiResponse.success("Pending verifications retrieved", users));
    }

    @GetMapping("/pending-kyc")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getPendingKyc() {
        List<UserDTO> users = userService.getPendingKycVerifications();
        return ResponseEntity.ok(ApiResponse.success("Pending KYC retrieved", users));
    }

    @PatchMapping("/{id}/verification")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateVerificationStatus(
            @PathVariable String id,
            @RequestParam User.VerificationStatus status,
            @RequestParam String verifiedBy) {
        UserDTO user = userService.updateVerificationStatus(id, status, verifiedBy);
        return ResponseEntity.ok(ApiResponse.success("Verification status updated", user));
    }

    @PatchMapping("/{id}/kyc")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateKycStatus(
            @PathVariable String id,
            @RequestParam User.KycStatus status,
            @RequestParam String verifiedBy) {
        UserDTO user = userService.updateKycStatus(id, status, verifiedBy);
        return ResponseEntity.ok(ApiResponse.success("KYC status updated", user));
    }
}

