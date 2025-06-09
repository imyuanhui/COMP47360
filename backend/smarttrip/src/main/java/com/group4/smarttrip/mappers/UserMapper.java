package com.group4.smarttrip.mappers;

import com.group4.smarttrip.dtos.RegisterUserRequest;
import com.group4.smarttrip.dtos.UpdateUserRequest;
import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel =  "spring")
public interface UserMapper {
    UserDto toDto(User user);

    @org.mapstruct.Mapping(target = "provider", constant = "local")
    User toEntity(RegisterUserRequest request);

    void update(UpdateUserRequest request, @MappingTarget User user);
}
