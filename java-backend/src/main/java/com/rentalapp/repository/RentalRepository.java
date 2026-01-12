package com.rentalapp.repository;

import com.rentalapp.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, String> {
    
    List<Rental> findByUserId(String userId);
    
    List<Rental> findByProductId(String productId);
    
    List<Rental> findByStatus(Rental.RentalStatus status);
    
    List<Rental> findByReturnRequestStatus(Rental.ReturnRequestStatus status);
    
    @Query("SELECT r FROM Rental r WHERE r.productId IN " +
           "(SELECT p.id FROM Product p WHERE p.vendorId = :vendorId) " +
           "ORDER BY r.createdAt DESC")
    List<Rental> findByVendorId(@Param("vendorId") String vendorId);
    
    @Query("SELECT r FROM Rental r WHERE r.status = 'ACTIVE' AND " +
           "r.endDate < CURRENT_DATE AND r.returnedAt IS NULL")
    List<Rental> findOverdueRentals();
}

