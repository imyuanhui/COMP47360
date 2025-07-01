package com.group4.smarttrip.mappers;

import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.DestinationDto;
import com.group4.smarttrip.dtos.UpdateDestinationRequest;
import com.group4.smarttrip.entities.Destination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface DestinationMapper {
    @Mappings({@Mapping(source = "trip.tripId", target = "tripId")})
    DestinationDto toDto(Destination destination);

    Destination toEntity(CreateDestinationRequest request);
    void update(UpdateDestinationRequest request, @MappingTarget Destination destination);
}
