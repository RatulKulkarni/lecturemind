package com.example.demo.questionbank;

import lombok.Data;

@Data
public class Concepts {
    private String concept_id;
    private String text;
    private double score;
    private int word_count;
    private int emphasis_count;

}
