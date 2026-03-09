export const sqlMap = [

  //  BASIC (1–8)
  { id: 1, title: "What is a Database?", x: 100, y: 250, requires: null, difficulty: "basic" },
  { id: 2, title: "What is SQL?", x: 200, y: 120, requires: 1, difficulty: "basic" },
  { id: 3, title: "Basic SELECT Statement", x: 320, y: 300, requires: 2, difficulty: "basic" },
  { id: 4, title: "WHERE Clause", x: 420, y: 180, requires: 3, difficulty: "basic" },
  { id: 5, title: "ORDER BY", x: 540, y: 320, requires: 3, difficulty: "basic" },
  { id: 6, title: "INSERT INTO", x: 640, y: 150, requires: 3, difficulty: "basic" },
  { id: 7, title: "UPDATE Statement", x: 760, y: 280, requires: 6, difficulty: "basic" },
  { id: 8, title: "DELETE Statement", x: 860, y: 120, requires: 6, difficulty: "basic" },

  //  INTERMEDIATE (9–17)
  { id: 9, title: "Aggregate Functions (COUNT, SUM, AVG)", x: 980, y: 300, requires: 4, difficulty: "intermediate" },
  { id: 10, title: "GROUP BY", x: 1080, y: 180, requires: 9, difficulty: "intermediate" },
  { id: 11, title: "HAVING Clause", x: 1200, y: 320, requires: 10, difficulty: "intermediate" },
  { id: 12, title: "INNER JOIN", x: 1300, y: 150, requires: 4, difficulty: "intermediate" },
  { id: 13, title: "LEFT and RIGHT JOIN", x: 1420, y: 290, requires: 12, difficulty: "intermediate" },
  { id: 14, title: "Subqueries", x: 1520, y: 130, requires: 9, difficulty: "intermediate" },
  { id: 15, title: "Constraints (PRIMARY KEY, FOREIGN KEY)", x: 1640, y: 260, requires: 1, difficulty: "intermediate" },
  { id: 16, title: "Indexes", x: 1740, y: 160, requires: 15, difficulty: "intermediate" },
  { id: 17, title: "Database Relationships", x: 1860, y: 300, requires: 15, difficulty: "intermediate" },

  //  ADVANCED (18–25)
  { id: 18, title: "Advanced JOINs", x: 1980, y: 140, requires: 13, difficulty: "advanced" },
  { id: 19, title: "Transactions (COMMIT / ROLLBACK)", x: 2080, y: 280, requires: 7, difficulty: "advanced" },
  { id: 20, title: "Views", x: 2200, y: 160, requires: 14, difficulty: "advanced" },
  { id: 21, title: "Stored Procedures", x: 2300, y: 300, requires: 20, difficulty: "advanced" },
  { id: 22, title: "Triggers", x: 2420, y: 140, requires: 21, difficulty: "advanced" },
  { id: 23, title: "Normalization", x: 2520, y: 260, requires: 17, difficulty: "advanced" },
  { id: 24, title: "Query Optimization", x: 2640, y: 160, requires: 16, difficulty: "advanced" },
  { id: 25, title: "Final SQL Project", x: 2760, y: 300, requires: 24, difficulty: "advanced" }

];