package com.skillarena.skillarena.repository;

import com.skillarena.skillarena.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
}