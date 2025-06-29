package com.group4.smarttrip.dtos;

import java.util.Objects;

public class LocationKey {
    // Each LocationKey represents a grid bucket (e.g. round to 0.1° ≈ 11km)
    private final double latBucket;
    private final double lonBucket;

    public LocationKey(double lat, double lon) {
        latBucket = Math.floor(lat * 10) / 10.0;
        lonBucket = Math.floor(lon * 10) / 10.0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LocationKey that)) return false;
        return Double.compare(that.latBucket, latBucket) == 0 &&
                Double.compare(that.lonBucket, lonBucket) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(latBucket, lonBucket);
    }
}
