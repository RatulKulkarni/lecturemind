package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class VideoSequenceChange {
    
    private String unitId;
    
    private List<String> sequence;
}
