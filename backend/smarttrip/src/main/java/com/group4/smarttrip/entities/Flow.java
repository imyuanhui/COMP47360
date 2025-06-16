package com.group4.smarttrip.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "historical_flows")
public class Flow {

    @EmbeddedId
    private FlowId id;

    private Double fareAmount;
    private Double hasCongestionSurcharge;
    private Integer isWeekend;
    private Double zoneAvgFlow;
    private Double logTotalFlow;
    private Double logMtaFlow;
    private Double logTaxiFlow;
    private Double logZoneAvgFlow;
}
