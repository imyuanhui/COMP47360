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
@Table(name = "trip_visits")
@IdClass(TripVisitId.class)
public class TripVisit {
    @Id
    @JoinColumn(name = "trip_id")
    @ManyToOne
    private Trip trip;

    @Id
    @JoinColumn(name = "place_id")
    @ManyToOne
    private Place place;

    private LocalDateTime visitTime;
}
