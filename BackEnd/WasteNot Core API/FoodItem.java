
//I am sure that I will be using this code later,
//and this one is for assignment purposes only. 
//Please save it.


// package com.wastenot.model;



// import java.time.LocalDate;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;

// @Entity
// public class FoodItem {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long foodId; // Corresponds to - foodID : int

//     private Long providerId; // Corresponds to # providerID : int
//     private String itemName;
//     private String category;
//     private Integer quantity; // Use wrapper class for DB interaction
//     private Double price;
//     private LocalDate expiryDate;
//     private Double discountRate = 0.0;
//     private String status; // e.g., "Available", "Reserved", "Sold"

//     // --- Constructor, Getters, and Setters would be here ---
//     // (Omitted for brevity, but a tool like Lombok is often used to generate them)

//     // Operation: calculateDiscount()
//     public Double calculateDiscountedPrice() {
//         return this.price * (1.0 - this.discountRate);
//     }
// }
