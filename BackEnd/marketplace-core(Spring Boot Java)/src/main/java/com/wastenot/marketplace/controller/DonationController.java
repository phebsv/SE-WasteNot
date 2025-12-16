package com.wastenot.marketplace.controller;

import com.wastenot.marketplace.model.Donation;
import com.wastenot.marketplace.model.Donation.DonationStatus;
import com.wastenot.marketplace.repository.DonationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private DonationRepository donationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDonations() {
        List<Donation> donations = donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.ACTIVE);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", donations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDonationById(@PathVariable Long id) {
        return donationRepository.findById(id)
                .map(donation -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", donation);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Donation not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<Map<String, Object>> getDonationsByProvider(@PathVariable Long providerId) {
        List<Donation> donations = donationRepository.findByProviderIdOrderByCreatedAtDesc(providerId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", donations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<Map<String, Object>> getDonationsByNgo(@PathVariable Long ngoId) {
        List<Donation> donations = donationRepository.findByClaimedByNgoId(ngoId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", donations);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDonation(@Valid @RequestBody Donation donation) {
        // Generate donation ID
        donation.setDonationId("D" + System.currentTimeMillis());
        Donation savedDonation = donationRepository.save(donation);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Donation created successfully");
        response.put("data", savedDonation);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<Map<String, Object>> claimDonation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> claimData) {
        
        return donationRepository.findById(id)
                .map(donation -> {
                    donation.setStatus(DonationStatus.CLAIMED);
                    donation.setClaimedByNgoId(Long.valueOf(claimData.get("ngoId").toString()));
                    donation.setClaimedByNgoName(claimData.get("ngoName").toString());
                    donation.setClaimedAt(LocalDateTime.now());
                    
                    Donation updatedDonation = donationRepository.save(donation);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Donation claimed successfully");
                    response.put("data", updatedDonation);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Donation not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDonation(@PathVariable Long id) {
        return donationRepository.findById(id)
                .map(donation -> {
                    donationRepository.delete(donation);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Donation deleted successfully");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Donation not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
