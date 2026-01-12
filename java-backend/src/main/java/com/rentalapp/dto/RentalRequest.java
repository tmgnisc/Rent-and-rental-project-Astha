package com.rentalapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RentalRequest {
    
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "Number of days is required")
    @Min(value = 1, message = "Minimum rental period is 1 day")
    private Integer days;
    
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    
    @NotBlank(message = "Contact phone is required")
    private String contactPhone;
    
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;
    private String deliveryLocationAddress;
}

