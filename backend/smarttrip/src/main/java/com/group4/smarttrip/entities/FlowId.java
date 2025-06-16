package com.group4.smarttrip.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlowId implements Serializable {

    private Long zoneId;
    private int hour;
    private int weekday;
    private int month;
}
