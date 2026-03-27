package com.example.demo.controller;

import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.example.demo.dto.UnitResponse;
import com.example.demo.dto.VideoSequenceChange;
import com.example.demo.model.Unit;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.UnitRequest;
import com.example.demo.service.UnitService;

@RestController
@RequestMapping("/unit")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping("/create")
    public ResponseEntity<?> createUnit(@RequestBody UnitRequest request) {

        Unit unit = unitService.createUnit(request);
        return ResponseEntity.ok(unit);
    }

    @PutMapping("/update/sequence")
    public ResponseEntity<?> updateLectureSequence(@RequestBody VideoSequenceChange request) {

        unitService.changeLectureSequence(request);
        return ResponseEntity.ok("Lecture Sequence is updated");
    }

    @GetMapping("/getunit/{id}")
    public ResponseEntity<?> getSemester(@PathVariable("id") String unitId) {

        Optional<UnitResponse> response = unitService.getCurrentUnit(unitId);
        
        return ResponseEntity.ok(response.get());
        
    }

    @GetMapping("/getnotes/{id}")
    public ResponseEntity<byte[]> getNotes(@PathVariable("id") String unitId) {

        byte[] pdf = unitService.generateUnitNotes(unitId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=unit-notes.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/getquestionbank/{id}")
    public ResponseEntity<byte[]> getQuestionBank(@PathVariable String unitId) {

        byte[] pdf = unitService.getQuestionBank(unitId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=question-bank.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // @GetMapping("/getQB/{id}")
    // public ResponseEntity<String> getQB(@PathVariable("id") String unitId) {
    //     String done = unitService.generateQuestionBank(unitId);
    //     return ResponseEntity.ok(done);
    // }

    
}
