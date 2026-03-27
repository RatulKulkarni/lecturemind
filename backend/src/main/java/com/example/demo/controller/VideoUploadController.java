package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.SingleLectureUploadRequest;
import com.example.demo.dto.SplitLectureUploadRequest;
import com.example.demo.service.LectureService;

@RequestMapping("/video")
@RestController
public class VideoUploadController {

    private final LectureService lectureService;

    public VideoUploadController(LectureService lectureService) {
        this.lectureService = lectureService;
    }
    
    @PostMapping("/upload/single")
    public ResponseEntity<?> singleLectureUpload(
            @ModelAttribute SingleLectureUploadRequest request,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        String lectureId = lectureService.handleSingleUpload(request, file);

        return ResponseEntity.ok("Lecture accepted for processing. ID: " + lectureId);
    }

    @PostMapping("/upload/split")
    public ResponseEntity<?> singleLectureUpload(
            @ModelAttribute SplitLectureUploadRequest request,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        List<String> lectures = lectureService.handleSplitUpload(request, file);

        return ResponseEntity.ok("Lecture accepted for processing. ID: " + lectures);
    }

    
}
