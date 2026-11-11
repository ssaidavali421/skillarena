
import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Trophy, Code2, Users, BarChart3,
  Settings, Bell, Search, Clock, ArrowUpRight,
  CheckCircle2, XCircle, Menu, Zap, Target, BookOpen,
  RefreshCw
} from "lucide-react";

import {
  getContests,
  joinContest,
  getProblems,
  submitAnswer,
  getSubmissions,
  getLeaderboard,
  getAnalytics
} from "./api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import "./index.css";

const STUDENT = "Student User";

function App() {
  const [active, setActive] = useState("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics] = useState({});

  const [joined, setJoined] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Contests", icon: Trophy },
    { name: "Problems", icon: Code2 },
    { name: "Leaderboard", icon: Users },
    { name: "Analytics", icon: BarChart3 }
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        contestRes,
        problemRes,
        submissionRes,
        leaderboardRes,
        analyticsRes
      ] = await Promise.all([
        getContests(),
        getProblems(),
        getSubmissions(),
        getLeaderboard(),
        getAnalytics()
      ]);

      setContests(contestRes.data || []);
      setProblems(problemRes.data || []);
      setSubmissions(submissionRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setAnalytics(analyticsRes.data || {});
    } catch (err) {
      console.error("API error:", err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to connect to the backend. Check whether Spring Boot is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = async (id) => {
    try {
      await joinContest(id);
      setJoined(old => old.includes(id) ? old : [...old, id]);
      setMessage("Successfully joined the contest!");
      await loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to join contest.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProblem || !answer.trim()) {
      setMessage("Please enter your answer.");
      return;
    }

    try {
      const response = await submitAnswer({
        studentName: STUDENT,
        problemId: selectedProblem.id,
        answer: answer
      });

      setMessage(
        "Submission result: " + response.data.result +
        " | Score: " + response.data.score
      );

      setAnswer("");
      setSelectedProblem(null);
      await loadData();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Submission failed."
      );
    }
  };

  const filteredContests = contests.filter(c =>
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredProblems = problems.filter(p =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const studentRank = leaderboard.find(
    s => s.name === STUDENT
  )?.rank ?? "-";

  const formatDate = (value) => {
    if (!value) return "Date not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const chartData = [
    { name: "Contests", value: analytics.totalContests || 0 },
    { name: "Problems", value: analytics.totalProblems || 0 },
    { name: "Submissions", value: analytics.totalSubmissions || 0 }
  ];

  const pieData = [
    {
      name: "Accepted",
      value: analytics.acceptedSubmissions || 0
    },
    {
      name: "Other",
      value: Math.max(
        0,
        (analytics.totalSubmissions || 0) -
        (analytics.acceptedSubmissions || 0)
      )
    }
  ];

  const getProblemName = (id) =>
    problems.find(p => p.id === id)?.title || `Problem #${id}`;

  const recentSubmissions = [...submissions]
    .reverse()
    .slice(0, 5);

  return (
    <div className="app">

      <aside className={`sidebar ${mobileMenu ? "show" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Zap size={23} /></div>
          <div>
            <h2>SkillArena</h2>
            <span>LEARN. COMPETE. GROW.</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {navigation.map(item => (
          <button
            key={item.name}
            className={`nav-item ${active === item.name ? "active" : ""}`}
            onClick={() => {
              setActive(item.name);
              setMobileMenu(false);
              setMessage("");
            }}
          >
            <item.icon size={19} />
            <span>{item.name}</span>
          </button>
        ))}

        <div className="nav-label secondary-label">ACCOUNT</div>

        <button
          className="nav-item"
          onClick={() => setActive("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">S</div>
            <div className="profile-info">
              <strong>{STUDENT}</strong>
              <span>Computer Science</span>
            </div>
            <span className="online-dot"></span>
          </div>
        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace / <strong>{active}</strong>
          </div>

          <div className="top-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search contests or problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <button className="notification">
              <Bell size={19} />
              <i></i>
            </button>

            <div className="top-avatar">S</div>
          </div>
        </header>

        <div className="content">

          <section className="welcome">
            <div>
              <div className="eyebrow">
                <span></span> STUDENT WORKSPACE
              </div>

              <h1>
                {active === "Overview"
                  ? "Welcome back, Student!"
                  : active}
              </h1>

              <p>
                Track your progress, challenge yourself and become a better problem solver.
              </p>
            </div>

            <div className="welcome-date">SKILLARENA · 2026</div>
          </section>

          {error && (
            <div className="api-error">
              {error}
              <button onClick={loadData}>Retry</button>
            </div>
          )}

          {message && (
            <div className="api-message">
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <RefreshCw className="spin" />
              <p>Loading SkillArena data...</p>
            </div>
          ) : (

            <>

              {active === "Overview" && (
                <>
                  <section className="stats-grid">
                    <Stat
                      icon={Code2}
                      label="Problems Solved"
                      value={analytics.problemsSolved ?? 0}
                      change="Accepted submissions"
                    />

                    <Stat
                      icon={Trophy}
                      label="Global Rank"
                      value={studentRank === "-" ? "-" : `#${studentRank}`}
                      change="Campus leaderboard"
                    />

                    <Stat
                      icon={Target}
                      label="Total Score"
                      value={analytics.totalScore ?? 0}
                      change="Earned points"
                    />

                    <Stat
                      icon={Zap}
                      label="Total Contests"
                      value={analytics.totalContests ?? 0}
                      change="Available contests"
                    />
                  </section>

                  <div className="section-heading">
                    <div>
                      <h2>Upcoming Contests</h2>
                      <p>Test your skills against other students</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setActive("Contests")}
                    >
                      View all <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <section className="contest-grid">
                    {contests.slice(0, 3).map(contest => (
                      <ContestCard
                        key={contest.id}
                        contest={contest}
                        joined={joined.includes(contest.id)}
                        onJoin={handleJoin}
                        formatDate={formatDate}
                      />
                    ))}

                    {contests.length === 0 && (
                      <p className="empty">No contests available yet.</p>
                    )}
                  </section>

                  <div className="bottom-grid">

                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Top Performers</h2>
                          <p>Campus leaderboard</p>
                        </div>

                        <button
                          className="text-button"
                          onClick={() => setActive("Leaderboard")}
                        >
                          View all
                        </button>
                      </div>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>RANK</th>
                              <th>STUDENT</th>
                              <th>SOLVED</th>
                              <th>SCORE</th>
                            </tr>
                          </thead>

                          <tbody>
                            {leaderboard.slice(0, 5).map(student => (
                              <tr key={student.uid}>
                                <td>
                                  <span className={`rank rank-${student.rank}`}>
                                    {student.rank}
                                  </span>
                                </td>

                                <td>
                                  <strong>{student.name}</strong>
                                  <small>{student.uid}</small>
                                </td>

                                <td>{student.solved}</td>

                                <td className="score">
                                  {student.score}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {leaderboard.length === 0 && (
                          <p className="empty">No leaderboard records yet.</p>
                        )}
                      </div>
                    </section>

                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Recent Submissions</h2>
                          <p>Latest database activity</p>
                        </div>
                        <Code2 size={19} className="muted" />
                      </div>

                      <div className="submission-list">
                        {recentSubmissions.map(s => (
                          <SubmissionItem
                            key={s.id}
                            submission={s}
                            problemName={getProblemName(s.problemId)}
                          />
                        ))}

                        {submissions.length === 0 && (
                          <p className="empty">No submissions yet.</p>
                        )}
                      </div>
                    </section>

                  </div>
                </>
              )}

              {active === "Contests" && (
                <section className="panel page-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>All Contests</h2>
                      <p>Discover and participate in coding competitions.</p>
                    </div>
                    <Trophy color="#a78bfa" />
                  </div>

                  {filteredContests.map(contest => (
                    <div className="contest-row" key={contest.id}>
                      <div className="contest-icon">
                        <Trophy />
                      </div>

                      <div className="contest-row-info">
                        <strong>{contest.title}</strong>
                        <span>
                          {contest.category} · {formatDate(contest.startTime)}
                          {" · "}{contest.participants} participants
                        </span>
                      </div>

                      <button
                        className={`join-button compact ${
                          joined.includes(contest.id) ? "joined" : ""
                        }`}
                        onClick={() => handleJoin(contest.id)}
                        disabled={joined.includes(contest.id)}
                      >
                        {joined.includes(contest.id) ? "Joined ✓" : "Join"}
                      </button>
                    </div>
                  ))}

                  {filteredContests.length === 0 && (
                    <p className="empty">No matching contests found.</p>
                  )}
                </section>
              )}

              {active === "Problems" && (
                <section className="panel page-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Practice Problems</h2>
                      <p>Improve your coding skills</p>
                    </div>
                    <BookOpen />
                  </div>

                  {filteredProblems.map(problem => (
                    <div className="contest-row" key={problem.id}>
                      <div className="contest-icon">
                        <Code2 />
                      </div>

                      <div className="contest-row-info">
                        <strong>{problem.title}</strong>
                        <span>
                          {problem.difficulty} · {problem.category}
                        </span>
                      </div>

                      <button
                        className="text-button"
                        onClick={() => {
                          setSelectedProblem(problem);
                          setAnswer("");
                          setMessage("");
                        }}
                      >
                        Solve <ArrowUpRight size={15} />
                      </button>
                    </div>
                  ))}

                  {filteredProblems.length === 0 && (
                    <p className="empty">No problems found.</p>
                  )}

                  {selectedProblem && (
                    <div className="problem-solver">
                      <h2>{selectedProblem.title}</h2>

                      <p>{selectedProblem.description}</p>

                      <form onSubmit={handleSubmit}>
                        <label>Your answer</label>

                        <textarea
                          value={answer}
                          onChange={e => setAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          required
                        />

                        <div className="solver-actions">
                          <button className="primary-button" type="submit">
                            Submit Answer
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setSelectedProblem(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </section>
              )}

              {active === "Leaderboard" && (
                <section className="panel page-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Campus Leaderboard</h2>
                      <p>Student rankings by total score</p>
                    </div>
                    <Trophy color="#a78bfa" />
                  </div>

                  {leaderboard.map(student => (
                    <div className="contest-row" key={student.uid}>
                      <span className={`rank rank-${student.rank}`}>
                        {student.rank}
                      </span>

                      <div className="contest-row-info">
                        <strong>{student.name}</strong>
                        <span>
                          {student.uid} · {student.solved} problems solved
                        </span>
                      </div>

                      <strong className="score">
                        {student.score} pts
                      </strong>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <p className="empty">No rankings yet. Submit a problem to get started!</p>
                  )}
                </section>
              )}

              {active === "Analytics" && (
                <>
                  <section className="stats-grid">
                    <Stat
                      icon={Code2}
                      label="Total Problems"
                      value={analytics.totalProblems ?? 0}
                      change="Available in database"
                    />

                    <Stat
                      icon={Target}
                      label="Accuracy"
                      value={`${analytics.accuracy ?? 0}%`}
                      change="Based on submissions"
                    />

                    <Stat
                      icon={Trophy}
                      label="Submissions"
                      value={analytics.totalSubmissions ?? 0}
                      change="All recorded attempts"
                    />

                    <Stat
                      icon={BarChart3}
                      label="Current Score"
                      value={analytics.totalScore ?? 0}
                      change="Performance points"
                    />
                  </section>

                  <div className="bottom-grid">
                    <section className="panel">
                      <h2>Platform Activity</h2>
                      <p className="muted">Database records by category</p>

                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#9299af" />
                            <YAxis stroke="#9299af" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#9472ec" radius={[5,5,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    <section className="panel">
                      <h2>Submission Results</h2>
                      <p className="muted">Accepted versus other submissions</p>

                      <div className="chart-container">
                        {analytics.totalSubmissions > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={85}
                                label
                              >
                                <Cell fill="#55d6a1" />
                                <Cell fill="#ef8297" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="empty">No submissions to display yet.</p>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {active === "Settings" && (
                <section className="panel page-panel">
                  <h2>Account Settings</h2>
                  <p className="muted">{STUDENT} · Computer Science</p>
                  <p>Profile and authentication settings will be connected in the next stage.</p>
                </section>
              )}

            </>
          )}

          <footer>
            © 2026 SkillArena · Campus Competitive Learning & Skill Benchmarking
          </footer>

        </div>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, change }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon"><Icon size={19} /></div>
      </div>
      <h2>{value}</h2>
      <p>{change}</p>
    </article>
  );
}

function ContestCard({ contest, joined, onJoin, formatDate }) {
  return (
    <article className="contest-card">
      <div className="contest-top">
        <div className="contest-icon"><Code2 size={21} /></div>
        <span className="status">{contest.status || "Open"}</span>
      </div>

      <span className="category">{contest.category}</span>
      <h3>{contest.title}</h3>

      <div className="contest-meta">
        <span><Clock size={15} /> {formatDate(contest.startTime)}</span>
        <span><Users size={15} /> {contest.participants} students</span>
      </div>

      <button
        className={`join-button ${joined ? "joined" : ""}`}
        onClick={() => onJoin(contest.id)}
        disabled={joined}
      >
        {joined ? "Joined ✓" : "Join contest"}
      </button>
    </article>
  );
}

function SubmissionItem({ submission, problemName }) {
  const accepted = submission.result === "Accepted";

  return (
    <div className="submission">
      <div className={`submission-icon ${accepted ? "accepted" : "rejected"}`}>
        {accepted ? <CheckCircle2 /> : <XCircle />}
      </div>

      <div className="submission-info">
        <strong>{problemName}</strong>
        <span>
          {submission.studentName} · Score: {submission.score}
        </span>
      </div>

      <span className={`result ${accepted ? "good" : "bad"}`}>
        {submission.result}
      </span>
    </div>
  );
}

export default App;
