package com.example.demo.dto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class LoginRequest {
    private String email;
    private String password;
}
