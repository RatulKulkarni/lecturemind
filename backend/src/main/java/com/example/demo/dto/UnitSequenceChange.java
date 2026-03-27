package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class UnitSequenceChange {
    
    private String semesterId;

    private List<String> sequence;
}
