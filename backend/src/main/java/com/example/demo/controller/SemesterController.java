package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UnitSequenceChange;
import com.example.demo.service.SemesterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/semester")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterService semesterService;

    @PostMapping("/create")
    public ResponseEntity<?> createSemester(@RequestBody SemesterRequest request) {
        return ResponseEntity.ok(semesterService.createSemester(request));
    }

    @PutMapping("/update/sequence")
    public ResponseEntity<?> updateLectureSequence(@RequestBody UnitSequenceChange request) {
        semesterService.changeUnitSequence(request);
        return ResponseEntity.ok("Lecture Sequence is updated");
    }

    @GetMapping("/getsemester")
    public ResponseEntity<?> getSemester() {

        return ResponseEntity.ok(semesterService.getCurrentSemester());
        
    }
}

