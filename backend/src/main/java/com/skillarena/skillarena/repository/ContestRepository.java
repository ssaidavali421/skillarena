package com.skillarena.skillarena.repository;

import com.skillarena.skillarena.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestRepository extends JpaRepository<Contest, Long> {
}