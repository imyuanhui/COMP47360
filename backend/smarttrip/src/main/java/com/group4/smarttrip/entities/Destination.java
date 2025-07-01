package com.group4.smarttrip.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "destinations")
public class Destination {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long destinationId;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lon;

    @Column(nullable = false)
    private String destinationName;

    @JoinColumn(name = "trip_id")
    @ManyToOne
    private Trip trip;

    @Column(nullable = false)
    private LocalDateTime visitTime;
}
