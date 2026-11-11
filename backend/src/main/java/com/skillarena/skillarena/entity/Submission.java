
package com.skillarena.skillarena.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;
    private Long problemId;

    @Column(length = 2000)
    private String answer;

    private String result;
    private int score;
    private LocalDateTime submittedAt;

    public Submission() {}

    @PrePersist
    public void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getStudentName() { return studentName; }
    public Long getProblemId() { return problemId; }
    public String getAnswer() { return answer; }
    public String getResult() { return result; }
    public int getScore() { return score; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public void setAnswer(String answer) { this.answer = answer; }
    public void setResult(String result) { this.result = result; }
    public void setScore(int score) { this.score = score; }
}
