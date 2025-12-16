package com.wastenot.marketplace.repository;

import com.wastenot.marketplace.model.Donation;
import com.wastenot.marketplace.model.Donation.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findByDonationId(String donationId);

    List<Donation> findByStatus(DonationStatus status);

    List<Donation> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<Donation> findByClaimedByNgoId(Long ngoId);

    List<Donation> findByStatusOrderByCreatedAtDesc(DonationStatus status);
}
