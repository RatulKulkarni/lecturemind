package com.example.demo.model;

import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {

    @Id
    private String id;

    private String name;

    private String academicYear;

    private String teacherId; 

    private LocalDateTime createdAt;

    @Builder.Default
    private List<String> unitSequence = new ArrayList<>();
}
