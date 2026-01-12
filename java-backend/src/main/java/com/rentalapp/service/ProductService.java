package com.rentalapp.service;

import com.rentalapp.dto.ProductRequest;
import com.rentalapp.exception.BadRequestException;
import com.rentalapp.exception.ResourceNotFoundException;
import com.rentalapp.model.Product;
import com.rentalapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(ProductRequest request, String vendorId) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setRentalPricePerDay(request.getRentalPricePerDay());
        product.setVendorId(vendorId);
        product.setVendorName(request.getVendorName());
        product.setVendorContact(request.getVendorContact());
        product.setLocation(request.getLocation());
        product.setLatitude(request.getLatitude());
        product.setLongitude(request.getLongitude());
        product.setStatus(Product.ProductStatus.AVAILABLE);

        return productRepository.save(product);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findByStatus(Product.ProductStatus.AVAILABLE);
    }

    public List<Product> getProductsByVendor(String vendorId) {
        return productRepository.findByVendorId(vendorId);
    }

    public List<Product> searchProducts(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(search);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product updateProduct(String id, ProductRequest request, String vendorId) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getVendorId().equals(vendorId)) {
            throw new BadRequestException("You can only update your own products");
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getRentalPricePerDay() != null) product.setRentalPricePerDay(request.getRentalPricePerDay());
        if (request.getVendorName() != null) product.setVendorName(request.getVendorName());
        if (request.getVendorContact() != null) product.setVendorContact(request.getVendorContact());
        if (request.getLocation() != null) product.setLocation(request.getLocation());
        if (request.getLatitude() != null) product.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) product.setLongitude(request.getLongitude());

        return productRepository.save(product);
    }

    public void deleteProduct(String id, String vendorId) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getVendorId().equals(vendorId)) {
            throw new BadRequestException("You can only delete your own products");
        }

        productRepository.delete(product);
    }

    public void updateProductStatus(String id, Product.ProductStatus status) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        product.setStatus(status);
        productRepository.save(product);
    }
}

