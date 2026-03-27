package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UnitResponse {

    private UnitData unit;
    private List<LectureData> lectures;

    @Data
    @Builder
    public static class UnitData {
        private String id;
        private String title;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class LectureData {
        private String id;
        private String title;
        private String thumbnailUrl;
        private String status;
        private LocalDateTime createdAt;
    }
}