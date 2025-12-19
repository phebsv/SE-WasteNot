package com.wastenot.marketplace.controller;

import com.wastenot.marketplace.model.Donation;
import com.wastenot.marketplace.repository.DonationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private DonationRepository donationRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDonation(@Valid @RequestBody Donation donation) {
        // Generate donation ID
        donation.setDonationId("D" + System.currentTimeMillis());
        Donation savedDonation = donationRepository.save(donation);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Donation request submitted successfully");
        response.put("data", savedDonation);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<Map<String, Object>> getDonationsByNgo(@PathVariable Long ngoId) {
        List<Donation> donations = donationRepository.findByClaimedByNgoId(ngoId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", donations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<Map<String, Object>> getDonationsByPartner(@PathVariable Long partnerId) {
        List<Donation> donations = donationRepository.findByProviderIdOrderByCreatedAtDesc(partnerId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", donations);
        return ResponseEntity.ok(response);
    }
}
