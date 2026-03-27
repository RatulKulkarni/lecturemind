package com.example.demo.questionbank;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Questions {
    private List<String> remember = new ArrayList<>();
    private List<String> understand = new ArrayList<>();
    private List<String> apply = new ArrayList<>();
    private List<String> analyze = new ArrayList<>();
    private List<String> evaluate = new ArrayList<>();

}
