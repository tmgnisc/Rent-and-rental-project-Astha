package com.rentalapp.controller;

import com.rentalapp.dto.ApiResponse;
import com.rentalapp.dto.ProductRequest;
import com.rentalapp.model.Product;
import com.rentalapp.model.User;
import com.rentalapp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {
        Product product = productService.createProduct(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        List<Product> products;
        
        if (search != null && !search.isEmpty()) {
            products = productService.searchProducts(search);
        } else if (category != null && !category.isEmpty()) {
            products = productService.getProductsByCategory(category);
        } else {
            products = productService.getAllProducts();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Product>>> getAvailableProducts() {
        List<Product> products = productService.getAvailableProducts();
        return ResponseEntity.ok(ApiResponse.success("Available products retrieved", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", product));
    }

    @GetMapping("/vendor/my-products")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<Product>>> getMyProducts(@AuthenticationPrincipal User user) {
        List<Product> products = productService.getProductsByVendor(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Your products retrieved", products));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {
        Product product = productService.updateProduct(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        productService.deleteProduct(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}

