package com.rentalapp.controller;

import com.rentalapp.dto.ApiResponse;
import com.rentalapp.dto.RentalRequest;
import com.rentalapp.model.Rental;
import com.rentalapp.model.User;
import com.rentalapp.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    @Autowired
    private RentalService rentalService;

    @PostMapping
    public ResponseEntity<ApiResponse<Rental>> createRental(
            @Valid @RequestBody RentalRequest request,
            @AuthenticationPrincipal User user) {
        Rental rental = rentalService.createRental(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Rental created successfully", rental));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Rental>> getRentalById(@PathVariable String id) {
        Rental rental = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.success("Rental retrieved", rental));
    }

    @GetMapping("/my-rentals")
    public ResponseEntity<ApiResponse<List<Rental>>> getMyRentals(@AuthenticationPrincipal User user) {
        List<Rental> rentals = rentalService.getRentalsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Your rentals retrieved", rentals));
    }

    @GetMapping("/vendor/analytics")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<Rental>>> getVendorAnalytics(@AuthenticationPrincipal User user) {
        List<Rental> rentals = rentalService.getRentalsByVendor(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Vendor analytics retrieved", rentals));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Rental>> confirmRental(@PathVariable String id) {
        Rental rental = rentalService.confirmRental(id);
        return ResponseEntity.ok(ApiResponse.success("Rental confirmed", rental));
    }

    @PostMapping("/{id}/handover")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Rental>> handoverRental(@PathVariable String id) {
        Rental rental = rentalService.handoverRental(id);
        return ResponseEntity.ok(ApiResponse.success("Product handed over", rental));
    }

    @PostMapping("/{id}/request-return")
    public ResponseEntity<ApiResponse<Rental>> requestReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String note = request.get("note");
        String imageUrl = request.get("imageUrl");
        Rental rental = rentalService.requestReturn(id, note, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Return requested", rental));
    }

    @PostMapping("/{id}/approve-return")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Rental>> approveReturn(@PathVariable String id) {
        Rental rental = rentalService.approveReturn(id);
        return ResponseEntity.ok(ApiResponse.success("Return approved", rental));
    }

    @PostMapping("/{id}/reject-return")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Rental>> rejectReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        String note = request.get("note");
        Rental rental = rentalService.rejectReturn(id, reason, note);
        return ResponseEntity.ok(ApiResponse.success("Return rejected", rental));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Rental>> cancelRental(@PathVariable String id) {
        Rental rental = rentalService.cancelRental(id);
        return ResponseEntity.ok(ApiResponse.success("Rental cancelled", rental));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<Rental>>> getOverdueRentals() {
        List<Rental> rentals = rentalService.getOverdueRentals();
        return ResponseEntity.ok(ApiResponse.success("Overdue rentals retrieved", rentals));
    }
}

