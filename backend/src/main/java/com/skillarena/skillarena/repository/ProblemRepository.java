package com.skillarena.skillarena.repository;

import com.skillarena.skillarena.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
}