package com.example.demo.questionbank;

import lombok.Data;

@Data
public class QuestionBankEntity {
    private int total_questions;
    private BloomDistribution bloomDistribution;
    private Questions questions;
}
