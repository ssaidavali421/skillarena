
package com.skillarena.skillarena.controller;

import com.skillarena.skillarena.entity.Contest;
import com.skillarena.skillarena.entity.Problem;
import com.skillarena.skillarena.entity.Submission;
import com.skillarena.skillarena.repository.ContestRepository;
import com.skillarena.skillarena.repository.ProblemRepository;
import com.skillarena.skillarena.repository.SubmissionRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class PlatformController {

    private final ContestRepository contestRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;

    public PlatformController(
            ContestRepository contestRepository,
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository) {
        this.contestRepository = contestRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
    }

    // GET ALL CONTESTS
    @GetMapping("/contests")
    public List<Contest> getContests() {
        return contestRepository.findAll();
    }

    // CREATE CONTEST
    @PostMapping("/contests")
    public Contest createContest(@RequestBody Contest contest) {
        return contestRepository.save(contest);
    }

    // JOIN CONTEST
    @PostMapping("/contests/{id}/join")
    public Contest joinContest(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Student User") String studentName) {

        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Contest not found"));

        contest.setParticipants(contest.getParticipants() + 1);

        return contestRepository.save(contest);
    }

    // GET ALL PROBLEMS
    @GetMapping("/problems")
    public List<Problem> getProblems() {
        return problemRepository.findAll();
    }

    // CREATE PROBLEM
    @PostMapping("/problems")
    public Problem createProblem(@RequestBody Problem problem) {
        return problemRepository.save(problem);
    }

    // SUBMIT ANSWER
    @PostMapping("/submissions")
    public Submission submitAnswer(@RequestBody Submission submission) {

        Problem problem = problemRepository.findById(
                submission.getProblemId()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Problem not found"));

        String expected = problem.getExpectedAnswer();
        String submitted = submission.getAnswer();

        boolean hasExpectedAnswer =
                expected != null && !expected.isBlank();

        boolean accepted = hasExpectedAnswer
                && submitted != null
                && expected.trim().equalsIgnoreCase(submitted.trim());

        submission.setResult(
                !hasExpectedAnswer ? "Submitted"
                        : accepted ? "Accepted" : "Wrong Answer"
        );

        submission.setScore(accepted ? 100 : 0);

        return submissionRepository.save(submission);
    }

    // GET SUBMISSIONS
    @GetMapping("/submissions")
    public List<Submission> getSubmissions() {
        return submissionRepository.findAll();
    }

    // LEADERBOARD
    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {

        Map<String, Map<String, Object>> students = new HashMap<>();

        for (Submission submission : submissionRepository.findAll()) {

            String name = submission.getStudentName();

            if (name == null || name.isBlank()) {
                name = "Unknown Student";
            }

            Map<String, Object> student = students.computeIfAbsent(
                    name, key -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("name", key);
                        data.put("score", 0);
                        data.put("solved", 0);
                        return data;
                    });

            student.put("score",
                    (int) student.get("score") + submission.getScore());

            if ("Accepted".equalsIgnoreCase(submission.getResult())) {
                student.put("solved",
                        (int) student.get("solved") + 1);
            }
        }

        List<Map<String, Object>> result = students.values()
                .stream()
                .sorted((a, b) ->
                        Integer.compare(
                                (int) b.get("score"),
                                (int) a.get("score")))
                .collect(Collectors.toList());

        for (int i = 0; i < result.size(); i++) {
            result.get(i).put("rank", i + 1);
            result.get(i).put("uid", "SA-" + (i + 1));
        }

        return result;
    }

    // ANALYTICS
    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {

        long totalContests = contestRepository.count();
        long totalProblems = problemRepository.count();
        List<Submission> submissions = submissionRepository.findAll();

        long totalSubmissions = submissions.size();

        long accepted = submissions.stream()
                .filter(s -> "Accepted".equalsIgnoreCase(s.getResult()))
                .count();

        int totalScore = submissions.stream()
                .mapToInt(Submission::getScore)
                .sum();

        double accuracy = totalSubmissions == 0
                ? 0
                : (accepted * 100.0 / totalSubmissions);

        Map<String, Object> analytics = new LinkedHashMap<>();

        analytics.put("totalContests", totalContests);
        analytics.put("totalProblems", totalProblems);
        analytics.put("totalSubmissions", totalSubmissions);
        analytics.put("acceptedSubmissions", accepted);
        analytics.put("problemsSolved", accepted);
        analytics.put("totalScore", totalScore);
        analytics.put("accuracy", Math.round(accuracy * 100.0) / 100.0);

        return analytics;
    }
}
