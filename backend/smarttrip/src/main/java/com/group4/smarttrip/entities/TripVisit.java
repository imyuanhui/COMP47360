//package com.group4.smarttrip.entities;
//
//
//import jakarta.persistence.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "trip_visits")
//@IdClass(TripVisitId.class)
//public class TripVisit {
//    @Id
//    @JoinColumn(name = "trip_id")
//    @ManyToOne
//    private Trip trip;
//
//    @Id
//    @JoinColumn(name = "place_id")
//    @ManyToOne
//    private Place place;
//
//    private LocalDateTime visitTime;
//}
