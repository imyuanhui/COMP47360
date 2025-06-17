package com.group4.smarttrip.mappers;

import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Trip;
import org.mapstruct.Mapper;

@Mapper(componentModel =  "spring",
        nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
public interface TripMapper {
    TripDto toDto(Trip trip);
    Trip toEntity(CreateTripRequest request);
}
