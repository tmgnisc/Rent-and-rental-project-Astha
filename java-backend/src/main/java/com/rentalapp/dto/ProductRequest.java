package com.rentalapp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Rental price is required")
    @DecimalMin(value = "0.01", message = "Rental price must be greater than 0")
    private BigDecimal rentalPricePerDay;
    
    private String vendorName;
    private String vendorContact;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
}

