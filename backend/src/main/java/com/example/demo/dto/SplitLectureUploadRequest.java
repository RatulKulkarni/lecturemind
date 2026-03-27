package com.example.demo.dto;

import lombok.Data;

@Data
public class SplitLectureUploadRequest {

    private String currentUnitId;

    private String nextUnitId;

    private String splitTime; // format: HH:MM

    private String titlePart1;

    private String titlePart2;
}
