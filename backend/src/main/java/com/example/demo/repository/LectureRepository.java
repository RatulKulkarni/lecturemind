package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Lecture;

import java.util.List;
import java.util.Optional;


public interface LectureRepository extends MongoRepository<Lecture, String> {
    
    List<Lecture> findByUnitId(String unitId);

    @Override
    Optional<Lecture> findById(String unitId);
}
