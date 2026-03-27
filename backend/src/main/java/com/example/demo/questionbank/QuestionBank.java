package com.example.demo.questionbank;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class QuestionBank {
    private int total_questions;
    private BloomDistribution bloom_distribution;
    private Questions questions;
    private List<String> warnings = new ArrayList<>();
    private List<Concepts> concepts = new ArrayList<>();
}
