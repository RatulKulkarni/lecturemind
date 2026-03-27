package com.example.demo.repository;

import com.example.demo.model.Semester;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SemesterRepository extends MongoRepository<Semester, String> {

    List<Semester> findByTeacherId(String teacherId);

    Optional<Semester> findByIdAndTeacherId(String id, String teacherId);
}
