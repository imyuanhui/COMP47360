package com.group4.smarttrip.mappers;

import com.group4.smarttrip.dtos.TripVisitDto;
import com.group4.smarttrip.entities.TripVisit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface TripVisitMapper {

    @Mappings({
            @Mapping(source = "trip.tripId", target = "tripId"),
            @Mapping(source = "place.placeId", target = "placeId")
    })
    TripVisitDto toDto(TripVisit tripVisit);

//    @Mappings({
//            @Mapping(source = "tripId", target = "trip", qualifiedByName = "mapTrip"),
//            @Mapping(source = "placeId", target = "place", qualifiedByName = "mapPlace")
//    })
//    TripVisit toEntity(TripVisitDto dto);
//
//    // These methods create partial entities (only IDs), often used in mapping
//    @Named("mapTrip")
//    default Trip mapTrip(Long id) {
//        if (id == null) return null;
//        Trip trip = new Trip();
//        trip.setId(id);
//        return trip;
//    }
//
//    @Named("mapPlace")
//    default Place mapPlace(Long id) {
//        if (id == null) return null;
//        Place place = new Place();
//        place.setId(id);
//        return place;
//    }
}
