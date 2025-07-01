package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UpdateDestinationRequest {
    private Long destinationId;
    private LocalDateTime visitTime;
}
