package com.example.demo.service;

import com.example.demo.model.Semester;
import com.example.demo.model.User;
import com.example.demo.repository.SemesterRepository;
import com.example.demo.repository.UnitRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;

import com.example.demo.controller.SemesterRequest;
import com.example.demo.dto.SemesterResponse;
import com.example.demo.dto.UnitSequenceChange;
import com.example.demo.model.Unit;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;

    public SemesterService(SemesterRepository semesterRepository,
                           UserRepository userRepository,
                           UnitRepository unitRepository) {
        this.semesterRepository = semesterRepository;
        this.userRepository = userRepository;
        this.unitRepository = unitRepository;
    }

    public Semester createSemester(SemesterRequest request) {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Semester semester = Semester.builder()
                .name(request.getName())
                .academicYear(request.getYear())
                .teacherId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        semester = semesterRepository.save(semester);

        user.setCurrentSemesterId(semester.getId());
        userRepository.save(user);

        return semester;
    }

    public void changeUnitSequence(UnitSequenceChange request) {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Semester semester = semesterRepository.findByIdAndTeacherId(request.getSemesterId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        semester.setUnitSequence(request.getSequence());

        semesterRepository.save(semester);

    }

    public ResponseEntity<?> getCurrentSemester() {

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getCurrentSemesterId() == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Semester> semesterOpt = semesterRepository.findByIdAndTeacherId(user.getId(), user.getCurrentSemesterId());
        Semester semester = semesterOpt.get();

        if(semester == null) {
            return ResponseEntity.ok(null);
        }      
        
        List<Unit> unitList = unitRepository.findByTeacherIdAndSemesterId(user.getId(), semester.getId());
        
        SemesterResponse response = SemesterResponse.builder()
        .semester(mapSemester(semester))
        .units(unitList.stream()
                .map(this::mapUnit)
                .toList())
        .build();

        return ResponseEntity.ok(response);
        
    }

    private SemesterResponse.SemesterData mapSemester(Semester semester) {
        return SemesterResponse.SemesterData.builder()
                .id(semester.getId())
                .name(semester.getName())
                .academicYear(semester.getAcademicYear())
                .build();
    }

    private SemesterResponse.UnitData mapUnit(Unit unit) {
        return SemesterResponse.UnitData.builder()
                .id(unit.getId())
                .title(unit.getTitle())
                .build();
    }
}
