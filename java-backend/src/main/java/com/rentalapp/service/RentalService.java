package com.rentalapp.service;

import com.rentalapp.dto.RentalRequest;
import com.rentalapp.exception.BadRequestException;
import com.rentalapp.exception.ResourceNotFoundException;
import com.rentalapp.model.Product;
import com.rentalapp.model.Rental;
import com.rentalapp.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private ProductService productService;

    @Transactional
    public Rental createRental(RentalRequest request, String userId) {
        Product product = productService.getProductById(request.getProductId());

        if (product.getStatus() != Product.ProductStatus.AVAILABLE) {
            throw new BadRequestException("Product is not available for rent");
        }

        BigDecimal totalAmount = product.getRentalPricePerDay()
            .multiply(new BigDecimal(request.getDays()));

        Rental rental = new Rental();
        rental.setUserId(userId);
        rental.setProductId(request.getProductId());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getStartDate().plusDays(request.getDays()));
        rental.setTotalAmount(totalAmount);
        rental.setDeliveryAddress(request.getDeliveryAddress());
        rental.setContactPhone(request.getContactPhone());
        rental.setDeliveryLatitude(request.getDeliveryLatitude());
        rental.setDeliveryLongitude(request.getDeliveryLongitude());
        rental.setDeliveryLocationAddress(request.getDeliveryLocationAddress());
        rental.setStatus(Rental.RentalStatus.PENDING);

        Rental savedRental = rentalRepository.save(rental);

        // Update product status
        productService.updateProductStatus(product.getId(), Product.ProductStatus.RENTED);

        return savedRental;
    }

    public Rental getRentalById(String id) {
        return rentalRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Rental not found"));
    }

    public List<Rental> getRentalsByUser(String userId) {
        return rentalRepository.findByUserId(userId);
    }

    public List<Rental> getRentalsByVendor(String vendorId) {
        return rentalRepository.findByVendorId(vendorId);
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public List<Rental> getOverdueRentals() {
        return rentalRepository.findOverdueRentals();
    }

    @Transactional
    public Rental confirmRental(String id) {
        Rental rental = getRentalById(id);
        rental.setStatus(Rental.RentalStatus.ACTIVE);
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental handoverRental(String id) {
        Rental rental = getRentalById(id);
        rental.setHandedOverAt(LocalDateTime.now());
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental requestReturn(String id, String note, String imageUrl) {
        Rental rental = getRentalById(id);
        
        if (rental.getStatus() != Rental.RentalStatus.ACTIVE) {
            throw new BadRequestException("Only active rentals can request return");
        }

        rental.setReturnRequestNote(note);
        rental.setReturnRequestImage(imageUrl);
        rental.setReturnRequestedAt(LocalDateTime.now());
        rental.setReturnRequestStatus(Rental.ReturnRequestStatus.PENDING);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental approveReturn(String id) {
        Rental rental = getRentalById(id);
        
        if (rental.getReturnRequestStatus() != Rental.ReturnRequestStatus.PENDING) {
            throw new BadRequestException("No pending return request");
        }

        rental.setReturnedAt(LocalDateTime.now());
        rental.setStatus(Rental.RentalStatus.COMPLETED);
        rental.setReturnRequestStatus(Rental.ReturnRequestStatus.APPROVED);

        // Calculate and set fine if overdue
        // TODO: Implement fine calculation logic

        Rental savedRental = rentalRepository.save(rental);

        // Update product status back to available
        productService.updateProductStatus(rental.getProductId(), Product.ProductStatus.AVAILABLE);

        return savedRental;
    }

    @Transactional
    public Rental rejectReturn(String id, String reason, String note) {
        Rental rental = getRentalById(id);
        
        if (rental.getReturnRequestStatus() != Rental.ReturnRequestStatus.PENDING) {
            throw new BadRequestException("No pending return request");
        }

        rental.setReturnRequestStatus(Rental.ReturnRequestStatus.REJECTED);
        rental.setReturnRejectionReason(reason);
        rental.setReturnRejectionNote(note);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental cancelRental(String id) {
        Rental rental = getRentalById(id);
        
        if (rental.getStatus() != Rental.RentalStatus.PENDING) {
            throw new BadRequestException("Only pending rentals can be cancelled");
        }

        rental.setStatus(Rental.RentalStatus.CANCELLED);
        Rental savedRental = rentalRepository.save(rental);

        // Update product status back to available
        productService.updateProductStatus(rental.getProductId(), Product.ProductStatus.AVAILABLE);

        return savedRental;
    }
}

