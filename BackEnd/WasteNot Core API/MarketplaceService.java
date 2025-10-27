//I am sure that I will be using this code later,
//and this one is for assignment purposes only. 
//Please save it.


// package com.wastenot.service;

// import com.wastenot.model.FoodItem;
// import com.wastenot.model.Transaction; // Assuming a Transaction model exists
// import com.wastenot.repository.FoodItemRepository;
// import com.wastenot.repository.TransactionRepository;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// public class MarketplaceService {

//     private final FoodItemRepository itemRepository;
//     private final TransactionRepository transactionRepository; // Dependency Injection

//     public MarketplaceService(FoodItemRepository itemRepository, TransactionRepository transactionRepository) {
//         this.itemRepository = itemRepository;
//         this.transactionRepository = transactionRepository;
//     }

//     // Aligns with Consumer's 'claimItem(foodID: int)' and Transaction's 'createTransaction()'
//     @Transactional // Ensures atomicity (success or complete failure) for the transaction
//     public Transaction claimFoodItem(Long foodId, Long consumerId, int quantity) {
//         FoodItem item = itemRepository.findById(foodId)
//             .orElseThrow(() -> new RuntimeException("FoodItem not found")); // Handle missing item

//         if (!"Available".equals(item.getStatus()) || item.getQuantity() < quantity) {
//             throw new RuntimeException("Item is not available or quantity is too high.");
//         }

//         // 1. Update FoodItem status and quantity (Inventory/Marketplace logic)
//         item.setQuantity(item.getQuantity() - quantity);
//         if (item.getQuantity() == 0) {
//             item.setStatus("Sold Out"); // Operation: updateStatus()
//         }
//         itemRepository.save(item);

//         // 2. Create Transaction record (Transaction Service logic)
//         Transaction transaction = new Transaction();
//         // ... set transaction details like foodId, buyerId, totalAmount, etc. ...
//         // transaction.setTotalAmount(item.calculateDiscountedPrice() * quantity);
        
//         return transactionRepository.save(transaction); // Operation: createTransaction()
//     }
// }