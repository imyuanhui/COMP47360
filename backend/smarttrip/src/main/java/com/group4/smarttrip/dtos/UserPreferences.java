package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPreferences {
    private String tripName;
    private String zoneName;
    private int startingTime;
    private int duration;
    private List<String> placeCategory;
}

