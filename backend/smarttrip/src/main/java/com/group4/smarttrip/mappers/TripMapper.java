package com.group4.smarttrip.mappers;

import com.group4.smarttrip.dtos.CreateUpdateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Trip;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel =  "spring")
public interface TripMapper {

    TripDto toDto(Trip trip);
    Trip toEntity(CreateUpdateTripRequest request);
    void updateTrip(CreateUpdateTripRequest request, @MappingTarget Trip trip);

}
