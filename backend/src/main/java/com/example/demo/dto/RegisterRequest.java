package com.example.demo.dto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
}
