package com.example.demo.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.SingleLectureUploadRequest;
import com.example.demo.dto.SplitLectureUploadRequest;
import com.example.demo.model.Lecture;
import com.example.demo.model.Unit;
import com.example.demo.repository.LectureRepository;
import com.example.demo.repository.UnitRepository;
import com.example.demo.util.DiskMultipartFile;

@Service
public class LectureService {

    private static final String BASE_DIR = System.getProperty("user.dir");
    private static final File UPLOAD_DIR = new File(BASE_DIR, "uploads");

    private final UnitRepository unitRepository;
    private final LectureRepository lectureRepository;
    private final VideoProcessingService videoProcessingService;

    public LectureService(UnitRepository unitRepository,
                          LectureRepository lectureRepository,
                          VideoProcessingService videoProcessingService) {
        this.unitRepository = unitRepository;
        this.lectureRepository = lectureRepository;
        this.videoProcessingService = videoProcessingService;
    }

    

    // ================= SINGLE UPLOAD =================
    public String handleSingleUpload(SingleLectureUploadRequest request, MultipartFile file) {

        try {

            UPLOAD_DIR.mkdirs();

            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Unit not found"));

            String originalName = file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");

            String lectureId = UUID.randomUUID().toString();

            File videoFile = new File(UPLOAD_DIR, lectureId + "_" + safeName);
            file.transferTo(videoFile);

            Lecture lecture = Lecture.builder()
                    .id(lectureId)
                    .unitId(request.getUnitId())
                    .title(request.getTitle())
                    .status("UPLOADED")
                    .teacherId(unit.getTeacherId())
                    .createdAt(LocalDateTime.now())
                    .build();

            lectureRepository.save(lecture);

            unit.getLectureSequence().add(lectureId);
            unitRepository.save(unit);

            videoProcessingService.processVideoAsync(lectureId, videoFile);

            return lectureId;

        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    // ================= SPLIT UPLOAD =================
    public List<String> handleSplitUpload(SplitLectureUploadRequest request, MultipartFile file) {

        try {

            UPLOAD_DIR.mkdirs();

            String originalName = file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");

            String baseId = UUID.randomUUID().toString();

            File originalVideo = new File(UPLOAD_DIR, baseId + "_" + safeName);
            file.transferTo(originalVideo);

            String splitTime = convertToFFmpegTime(request.getSplitTime());

            File part1 = new File(UPLOAD_DIR, baseId + "_part1.mp4");
            File part2 = new File(UPLOAD_DIR, baseId + "_part2.mp4");

            // Split Part 1
            ProcessBuilder part1Builder = new ProcessBuilder(
                    "ffmpeg",
                    "-y",
                    "-i", originalVideo.getAbsolutePath(),
                    "-t", splitTime,
                    "-c", "copy",
                    part1.getAbsolutePath()
            );
            part1Builder.redirectErrorStream(true);
            Process p1 = part1Builder.start();
            p1.waitFor();

            // Split Part 2
            ProcessBuilder part2Builder = new ProcessBuilder(
                    "ffmpeg",
                    "-y",
                    "-i", originalVideo.getAbsolutePath(),
                    "-ss", splitTime,
                    "-c", "copy",
                    part2.getAbsolutePath()
            );
            part2Builder.redirectErrorStream(true);
            Process p2 = part2Builder.start();
            p2.waitFor();

            MultipartFile part1Multipart = new DiskMultipartFile(part1);
            MultipartFile part2Multipart = new DiskMultipartFile(part2);

            // Upload Part 1
            SingleLectureUploadRequest req1 = new SingleLectureUploadRequest();
            req1.setUnitId(request.getCurrentUnitId());
            req1.setTitle(request.getTitlePart1());

            String lectureId1 = handleSingleUpload(req1, part1Multipart);

            // Upload Part 2
            SingleLectureUploadRequest req2 = new SingleLectureUploadRequest();
            req2.setUnitId(request.getNextUnitId());
            req2.setTitle(request.getTitlePart2());

            String lectureId2 = handleSingleUpload(req2, part2Multipart);

            List<String> lectureIds = new ArrayList<>();
            lectureIds.add(lectureId1);
            lectureIds.add(lectureId2);

            return lectureIds;

        } catch (IOException | IllegalStateException | InterruptedException e) {
            throw new RuntimeException("Split upload failed: " + e.getMessage());
        }
    }

    private String convertToFFmpegTime(String hhmm) {
        return hhmm + ":00";
    }
}
