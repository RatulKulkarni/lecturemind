package com.example.demo.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.demo.model.Lecture;
import com.example.demo.repository.LectureRepository;
// import com.example.demo.repository.UnitRepository;

@Service
public class VideoProcessingService {

    private static final String BASE_DIR = System.getProperty("user.dir");
    private static final File OUTPUT_DIR = new File(BASE_DIR, "outputs");

    @Value("${PYTHON_API_URL}")
    private String url;

    @Autowired
    private UnitService unitService;

    // @Autowired
    // private UnitRepository unitRepository;

    // private static final String PYTHON_API_URL_FINAL = url+"/transcribe";

    private final LectureRepository lectureRepository;

    public VideoProcessingService(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
    }

    @Async
    public void processVideoAsync(String lectureId, File videoFile) {

        try {
            OUTPUT_DIR.mkdirs();

            File thumbnailFile = generateThumbnail(lectureId, videoFile);
            File rawAudio = extractAudio(lectureId, videoFile);

            if (rawAudio == null) {
                System.out.println("Audio extraction failed for lecture: " + lectureId);
                return;
            }

            File cleanedAudio = cleanAudio(lectureId, rawAudio);

            String pythonResponse = callPythonService(cleanedAudio);
            if (rawAudio.exists()) {
                rawAudio.delete();
            }

            if (cleanedAudio.exists()) {
                cleanedAudio.delete();
            }

            File transcriptFile = saveTranscriptJson(lectureId, pythonResponse);

            updateLecture(lectureId, thumbnailFile, transcriptFile);

            unitService.generateQuestionBank(lectureId);

            System.out.println("Lecture processing completed");

        } catch (Exception e) {
            System.out.println("Processing failed for lecture " + lectureId + ": " + e.getMessage());
        }
    }

    private File generateThumbnail(String lectureId, File videoFile) throws Exception {

        File thumbnailFile = new File(OUTPUT_DIR, lectureId + "_thumb.jpg");

        ProcessBuilder builder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-ss", "00:00:02",
                "-i", videoFile.getAbsolutePath(),
                "-vframes", "1",
                thumbnailFile.getAbsolutePath()
        );

        executeProcess(builder);

        System.out.println("Thumbnail generated: " + thumbnailFile.getAbsolutePath());
        return thumbnailFile;
    }

    private File extractAudio(String lectureId, File videoFile) throws Exception {

        File audioFile = new File(OUTPUT_DIR, lectureId + ".wav");

        ProcessBuilder builder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-i", videoFile.getAbsolutePath(),
                "-vn",
                "-ac", "1",
                "-ar", "16000",
                audioFile.getAbsolutePath()
        );

        executeProcess(builder);

        if (!audioFile.exists()) {
            return null;
        }

        System.out.println("Audio extracted: " + audioFile.getAbsolutePath());
        return audioFile;
    }

    // =========================
    // NEW STAGE: AUDIO CLEANING
    // =========================
    private File cleanAudio(String lectureId, File rawAudio) throws Exception {

        File cleanedAudio = new File(OUTPUT_DIR, lectureId + "_clean.wav");

        ProcessBuilder builder = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-i", rawAudio.getAbsolutePath(),
                "-af",
                "afftdn,silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB:detection=peak,"
                + "acompressor,loudnorm",
                cleanedAudio.getAbsolutePath()
        );

        executeProcess(builder);

        System.out.println("Audio cleaned: " + cleanedAudio.getAbsolutePath());
        return cleanedAudio;
    }

    private String callPythonService(File audioFile) {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("lecture_file", new FileSystemResource(audioFile));

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        String final_url = url+"/transcribe";

        String response = restTemplate.postForObject(
                final_url,
                request,
                String.class
        );

        System.out.println("Python Response received");
        return response;
    }

    private File saveTranscriptJson(String lectureId, String pythonResponse) throws IOException {

        File transcriptFile = new File(OUTPUT_DIR, lectureId + "_transcript.json");

        try (FileWriter writer = new FileWriter(transcriptFile)) {
            writer.write(pythonResponse);
        }

        System.out.println("Transcript saved: " + transcriptFile.getAbsolutePath());
        return transcriptFile;
    }

    private void updateLecture(String lectureId, File thumbnailFile, File transcriptFile) {

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        lecture.setThumbnailPath(thumbnailFile.getAbsolutePath());
        lecture.setTranscriptPath(transcriptFile.getAbsolutePath());
        lecture.setStatus("DONE");

        lectureRepository.save(lecture);

        System.out.println("Lecture updated successfully");
    }

    private void executeProcess(ProcessBuilder builder) throws Exception {

        builder.redirectErrorStream(true);
        Process process = builder.start();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            while (reader.readLine() != null) {}
        }

        process.waitFor(60, TimeUnit.SECONDS);
    }
}
