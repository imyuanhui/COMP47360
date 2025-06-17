package com.group4.smarttrip.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "places")
public class Place {

    @Id
    @Column(nullable = false)
    private Long placeId;

    @Column(nullable = false)
    private String placeName;

    private float lat;
    private float lon;

    @ManyToOne
    @JoinColumn(name = "zone_id")
    private Zone zone;

    private String category;
    private String priceLevel;
}
