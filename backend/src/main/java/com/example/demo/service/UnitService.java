package com.example.demo.service;

import java.io.ByteArrayOutputStream;

import com.example.demo.dto.UnitResponse;
import com.example.demo.dto.VideoSequenceChange;
import com.example.demo.model.Semester;
import com.example.demo.model.Unit;
import com.example.demo.model.User;
import com.example.demo.repository.LectureRepository;
import com.example.demo.repository.SemesterRepository;
import com.example.demo.repository.UnitRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.dto.UnitRequest;
import com.example.demo.model.Lecture;
import com.example.demo.questionbank.QuestionBank;
import com.fasterxml.jackson.core.JsonProcessingException;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final LectureRepository lectureRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${PYTHON_API_URL}")
    private String url;

    public Unit createUnit(UnitRequest request) {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String semesterId = user.getCurrentSemesterId();

        if (semesterId == null) {
            throw new RuntimeException("No active semester selected");
        }

        Semester semester = semesterRepository
                .findByIdAndTeacherId(semesterId, user.getId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        Unit unit = Unit.builder()
                .title(request.getTitle())
                .semesterId(semester.getId())
                .teacherId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        unit = unitRepository.save(unit);

        semester.getUnitSequence().add(unit.getId());
        semesterRepository.save(semester);

        return unit;
    }

    public byte[] generateUnitNotes(String unitId) {

        List<String> lectureIds = unitRepository.findById(unitId).get().getLectureSequence();
        List<Lecture> lectures = new ArrayList<>();

        for(String ids : lectureIds) {
            Optional<Lecture> temp = lectureRepository.findById(ids);
            if(temp.isPresent())
                lectures.add(lectureRepository.findById(ids).get());
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> segments = new ArrayList<>();

        try {

                for (Lecture lecture : lectures) {

                    String jsonContent = readJsonFile(lecture.getTranscriptPath());

                    List<Map<String, Object>> lectureSegments =
                            mapper.readValue(jsonContent, List.class);
                            segments.addAll(lectureSegments);
                }

        } catch (JsonProcessingException e) {
                throw new RuntimeException("Error parsing transcript JSON", e);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("segments", segments);

        System.out.println(requestBody.get("segments"));

        ResponseEntity<byte[]> response = restTemplate.postForEntity(
                url + "/summarize",
                requestBody,
                byte[].class
        );

        return response.getBody();
    }

    public void changeLectureSequence(VideoSequenceChange request) {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Unit unit = unitRepository.findByIdAndTeacherId(request.getUnitId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        unit.setLectureSequence(request.getSequence());

        unitRepository.save(unit);

    }

    public Optional<UnitResponse> getCurrentUnit(String unitId) {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getCurrentSemesterId() == null) {
            return Optional.empty();
        }

        Optional<Unit> unitOpt = unitRepository.findByIdAndTeacherId(unitId, user.getId());

        if (unitOpt.isEmpty()) {
            return Optional.empty();
        }

        Unit unit = unitOpt.get();

        List<Lecture> lectureList = lectureRepository.findByUnitId(unit.getId());

        Map<String, Lecture> lectureMap = lectureList.stream()
                .collect(Collectors.toMap(Lecture::getId, l -> l));

        List<UnitResponse.LectureData> lectureDataList = unit.getLectureSequence()
                .stream()
                .map(lectureMap::get)
                .filter(Objects::nonNull)
                .map(this::mapLecture)
                .toList();

        return Optional.of(UnitResponse.builder()
                .unit(mapUnit(unit))
                .lectures(lectureDataList)
                .build());
    }

    private UnitResponse.UnitData mapUnit(Unit unit) {
        return UnitResponse.UnitData.builder()
                .id(unit.getId())
                .title(unit.getTitle())
                .createdAt(unit.getCreatedAt())
                .build();
    }

    private UnitResponse.LectureData mapLecture(Lecture lecture) {
        return UnitResponse.LectureData.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .thumbnailUrl("/api/lectures/" + lecture.getId() + "/thumbnail")
                .status(lecture.getStatus())
                .createdAt(lecture.getCreatedAt())
                .build();
    }

    private String readJsonFile(String path) {
        try {
            return new String(Files.readAllBytes(Paths.get(path)));
        } catch (IOException e) {
            throw new RuntimeException("Error reading transcript file", e);
        }
    }

    // private String extractText(String jsonContent) {

    //     ObjectMapper mapper = new ObjectMapper();
    //     StringBuilder text = new StringBuilder();

    //     try {

    //         JsonNode root = mapper.readTree(jsonContent);
    //         JsonNode transcriptArray = root.get("transcript");

    //         if (transcriptArray != null && transcriptArray.isArray()) {

    //             for (JsonNode node : transcriptArray) {

    //                 JsonNode textNode = node.get("text");

    //                 if (textNode != null) {
    //                     text.append(textNode.asText()).append(" ");
    //                 }
    //             }
    //         }

    //     } catch (JsonProcessingException e) {
    //         throw new RuntimeException("Error extracting transcript text", e);
    //     }

    //     return text.toString();
    // }

    public void generateQuestionBank(String lectureId) {
        System.out.println("Question Bank Service called");
        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new RuntimeException("Lecture not found"));
        List<String> lectureIds = unitRepository.findById(lecture.getUnitId()).get().getLectureSequence();
        List<Lecture> lectures = new ArrayList<>();

        for (String ids : lectureIds) {
            Optional<Lecture> temp = lectureRepository.findById(ids);
            if (temp.isPresent()) {
                lectures.add(temp.get());
            }
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> segments = new ArrayList<>();

        try {

            for (Lecture l : lectures) {

                String jsonContent = readJsonFile(l.getTranscriptPath());

                List<Map<String, Object>> lectureSegments =
                        mapper.readValue(jsonContent, List.class);

                segments.addAll(lectureSegments);
            }

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing transcript JSON", e);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("segments", segments);

        // System.out.println(requestBody.get("segments"));

        String final_url = url+"/question-bank";

        ResponseEntity<QuestionBank> response = restTemplate.postForEntity(
                final_url,
                requestBody,
                QuestionBank.class
        );

        System.out.println(response.getBody());

        Unit unit = unitRepository.findById(lecture.getUnitId()).get();
        unit.setQuestionBank(response.getBody());
        unit.getLectureSequence().add(lectureId);

        unitRepository.save(unit);
        System.out.println("Question Bank service ends");

    }

    
    public byte[] getQuestionBank(String unitId) {

        Unit unit = unitRepository.findById(unitId)
            .orElseThrow(() -> new RuntimeException("Unit not found"));

        QuestionBank qb = unit.getQuestionBank();

        if (qb == null) {
            throw new RuntimeException("Question bank not generated for this unit");
        }

        try {

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            try (Document document = new Document(pdfDoc)) {
                document.add(new Paragraph("Question Bank")
                        .setBold()
                        .setFontSize(18));

                document.add(new Paragraph(""));

                addSection(document, "Remember", qb.getQuestions().getRemember());
                addSection(document, "Understand", qb.getQuestions().getUnderstand());
                addSection(document, "Apply", qb.getQuestions().getApply());
                addSection(document, "Analyze", qb.getQuestions().getAnalyze());
                addSection(document, "Evaluate", qb.getQuestions().getEvaluate());
            }

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addSection(Document document, String title, List<String> questions) {

        if (questions == null || questions.isEmpty()) {
            return;
        }

        document.add(new Paragraph(title)
                .setBold()
                .setFontSize(14));

        int index = 1;

        for (String q : questions) {
            document.add(new Paragraph(index + ". " + q));
            index++;
        }

        document.add(new Paragraph(""));
    }
}