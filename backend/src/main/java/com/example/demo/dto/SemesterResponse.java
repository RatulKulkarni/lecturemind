package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SemesterResponse {

    private SemesterData semester;
    private List<UnitData> units;

    @Data
    @Builder
    public static class SemesterData {
        private String id;
        private String name;
        private String academicYear;
    }

    @Data
    @Builder
    public static class UnitData {
        private String id;
        private String title;
    }
}