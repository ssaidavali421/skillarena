
package com.skillarena.skillarena.config;

import com.skillarena.skillarena.entity.Contest;
import com.skillarena.skillarena.entity.Problem;
import com.skillarena.skillarena.repository.ContestRepository;
import com.skillarena.skillarena.repository.ProblemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ContestRepository contestRepository;
    private final ProblemRepository problemRepository;

    public DataInitializer(
            ContestRepository contestRepository,
            ProblemRepository problemRepository) {
        this.contestRepository = contestRepository;
        this.problemRepository = problemRepository;
    }

    @Override
    public void run(String... args) {

        // INSERT SAMPLE CONTESTS
        if (contestRepository.count() == 0) {

            Contest c1 = new Contest();
            c1.setTitle("Weekly Coding Challenge");
            c1.setCategory("DSA");
            c1.setDescription("Test your data structures and algorithms skills.");
            c1.setStartTime(LocalDateTime.now().plusDays(1));
            c1.setParticipants(128);
            c1.setStatus("Upcoming");

            Contest c2 = new Contest();
            c2.setTitle("Database Masters");
            c2.setCategory("DBMS");
            c2.setDescription("Challenge yourself with SQL and database concepts.");
            c2.setStartTime(LocalDateTime.now().plusDays(2));
            c2.setParticipants(86);
            c2.setStatus("Upcoming");

            Contest c3 = new Contest();
            c3.setTitle("Algorithm Sprint");
            c3.setCategory("Algorithms");
            c3.setDescription("Solve challenging algorithmic problems.");
            c3.setStartTime(LocalDateTime.now().plusDays(3));
            c3.setParticipants(214);
            c3.setStatus("Open");

            contestRepository.saveAll(List.of(c1, c2, c3));

            System.out.println("SkillArena: 3 contests inserted!");
        }

        // INSERT SAMPLE PROBLEMS
        if (problemRepository.count() == 0) {

            Problem p1 = new Problem();
            p1.setTitle("Two Sum");
            p1.setCategory("Arrays");
            p1.setDifficulty("Easy");
            p1.setDescription("Find two numbers in an array whose sum equals the target. Enter the target number as your answer.");
            p1.setExpectedAnswer("9");

            Problem p2 = new Problem();
            p2.setTitle("Binary Search");
            p2.setCategory("Searching");
            p2.setDifficulty("Easy");
            p2.setDescription("What is the zero-based index of 30 in the sorted array [10, 20, 30, 40, 50]?");
            p2.setExpectedAnswer("2");

            Problem p3 = new Problem();
            p3.setTitle("Palindrome Check");
            p3.setCategory("Strings");
            p3.setDifficulty("Medium");
            p3.setDescription("Enter the reverse of the word LEVEL.");
            p3.setExpectedAnswer("LEVEL");

            Problem p4 = new Problem();
            p4.setTitle("Factorial");
            p4.setCategory("Mathematics");
            p4.setDifficulty("Medium");
            p4.setDescription("Calculate the factorial of 5.");
            p4.setExpectedAnswer("120");

            problemRepository.saveAll(List.of(p1, p2, p3, p4));

            System.out.println("SkillArena: 4 problems inserted!");
        }

        System.out.println("SkillArena database initialization completed!");
    }
}
