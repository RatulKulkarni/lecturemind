package com.example.demo.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "lectures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecture {

    @Id
    private String id;

    private String unitId; 

    private String title;

    private String thumbnailPath;

    private String transcriptPath;

    private String annotatedTranscriptPath;

    private String status;

    private LocalDateTime createdAt;

    private String teacherId; 
}
