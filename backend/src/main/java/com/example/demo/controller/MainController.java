package com.example.demo.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/video")
public class MainController {

    private static final String BASE_DIR = System.getProperty("user.dir");
    private static final File UPLOAD_DIR = new File(BASE_DIR, "uploads");
    private static final File OUTPUT_DIR = new File(BASE_DIR, "outputs");

    // Python FastAPI
    private static final String PYTHON_API_URL = "http://localhost:8000/transcribe";

    // Second downstream API
    // private static final String SECOND_API_URL = "https://9s232mtn-8000.inc1.devtunnels.ms/process-lecture";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndProcess(@RequestParam("file") MultipartFile file) {

        System.out.println("=== REQUEST RECEIVED ===");

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Ensure directories exist
            UPLOAD_DIR.mkdirs();
            OUTPUT_DIR.mkdirs();

            // Sanitize filename (Windows safe)
            String originalName = file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");

            String videoId = UUID.randomUUID().toString();

            File videoFile = new File(UPLOAD_DIR, videoId + "_" + safeName);
            file.transferTo(videoFile);

            System.out.println("Video saved: " + videoFile.getAbsolutePath());

            File audioFile = new File(OUTPUT_DIR, videoId + ".wav");

            // =========================
            // FFmpeg AUDIO EXTRACTION
            // =========================
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "ffmpeg",
                    "-y",
                    "-i", videoFile.getAbsolutePath(),
                    "-vn",
                    "-ac", "1",
                    "-ar", "16000",
                    audioFile.getAbsolutePath()
            );

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[FFmpeg] " + line);
                }
            }

            boolean finished = process.waitFor(60, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("FFmpeg timed out");
            }

            if (!audioFile.exists()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Audio extraction failed");
            }

            System.out.println("Audio extracted: " + audioFile.getAbsolutePath());

            // =========================
            // CALL PYTHON FASTAPI
            // =========================
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders pythonHeaders = new HttpHeaders();
            pythonHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> pythonBody = new LinkedMultiValueMap<>();
            pythonBody.add("file", new FileSystemResource(audioFile));

            HttpEntity<MultiValueMap<String, Object>> pythonRequest =
                    new HttpEntity<>(pythonBody, pythonHeaders);

            System.out.println("Calling Python transcription service...");

            String pythonResponse = restTemplate.postForObject(
                    PYTHON_API_URL,
                    pythonRequest,
                    String.class
            );

            System.out.println("Received response from Python service");

            // // =========================
            // // CALL SECOND API
            // // =========================
            // HttpHeaders secondHeaders = new HttpHeaders();
            // secondHeaders.setContentType(MediaType.APPLICATION_JSON);

            // HttpEntity<String> secondRequest =
            //         new HttpEntity<>(pythonResponse, secondHeaders);

            // System.out.println("Calling second downstream API...");

            // String finalResponse = restTemplate.postForObject(
            //         SECOND_API_URL,
            //         secondRequest,
            //         String.class
            // );

            // System.out.println("Received response from second API");

            // // =========================
            // // RETURN FINAL RESPONSE
            // // =========================
            return ResponseEntity.ok(pythonResponse);

        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}

