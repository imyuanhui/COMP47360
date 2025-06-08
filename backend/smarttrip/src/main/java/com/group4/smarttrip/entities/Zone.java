package com.group4.smarttrip.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "zones")
public class Zone {
    @Id
    private long zoneId;

    private String zoneName;
    private double centralLat;
    private double centralLon;

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(zone_id: " + zoneId + ", zone_name: " + zoneName + ")";
    }
}
