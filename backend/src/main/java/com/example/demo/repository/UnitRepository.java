package com.example.demo.repository;

import com.example.demo.model.Unit;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UnitRepository extends MongoRepository<Unit, String> {

    List<Unit> findByTeacherIdAndSemesterId(String teacherId, String semesterId);

    Optional<Unit> findByIdAndTeacherId(String id, String teacherId);

}
