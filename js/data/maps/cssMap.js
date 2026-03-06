export const cssMap = [

  //  BASIC (1–8)
  { id: 1, title: "What is CSS?", x: 100, y: 250, requires: null, difficulty: "basic" },
  { id: 2, title: "Selectors (Class, ID, Element)", x: 200, y: 120, requires: 1, difficulty: "basic" },
  { id: 3, title: "Colors and Units (px, %, rem, em)", x: 320, y: 300, requires: 2, difficulty: "basic" },
  { id: 4, title: "Box Model", x: 420, y: 180, requires: 2, difficulty: "basic" },
  { id: 5, title: "Display Property", x: 540, y: 320, requires: 4, difficulty: "basic" },
  { id: 6, title: "Positioning (static, relative, absolute)", x: 640, y: 150, requires: 4, difficulty: "basic" },
  { id: 7, title: "Flexbox Basics", x: 760, y: 280, requires: 5, difficulty: "basic" },
  { id: 8, title: "Responsive Basics (Media Queries)", x: 860, y: 120, requires: 7, difficulty: "basic" },

  //  INTERMEDIATE (9–17)
  { id: 9, title: "Advanced Selectors", x: 980, y: 300, requires: 2, difficulty: "intermediate" },
  { id: 10, title: "Pseudo-classes & Pseudo-elements", x: 1080, y: 180, requires: 9, difficulty: "intermediate" },
  { id: 11, title: "Transitions", x: 1200, y: 320, requires: 5, difficulty: "intermediate" },
  { id: 12, title: "Transformations", x: 1300, y: 150, requires: 11, difficulty: "intermediate" },
  { id: 13, title: "Animations", x: 1420, y: 290, requires: 12, difficulty: "intermediate" },
  { id: 14, title: "CSS Variables", x: 1520, y: 130, requires: 3, difficulty: "intermediate" },
  { id: 15, title: "Grid Layout", x: 1640, y: 260, requires: 7, difficulty: "intermediate" },
  { id: 16, title: "Advanced Responsive Design", x: 1740, y: 160, requires: 8, difficulty: "intermediate" },
  { id: 17, title: "Z-Index and Stacking Context", x: 1860, y: 300, requires: 6, difficulty: "intermediate" },

  //  ADVANCED (18–25)
  { id: 18, title: "Advanced Flexbox Patterns", x: 1980, y: 140, requires: 7, difficulty: "advanced" },
  { id: 19, title: "CSS Architecture (BEM, SMACSS)", x: 2080, y: 280, requires: 14, difficulty: "advanced" },
  { id: 20, title: "Performance Optimization", x: 2200, y: 160, requires: 13, difficulty: "advanced" },
  { id: 21, title: "Dark Mode & Theming", x: 2300, y: 300, requires: 14, difficulty: "advanced" },
  { id: 22, title: "Custom Properties at Scale", x: 2420, y: 140, requires: 19, difficulty: "advanced" },
  { id: 23, title: "Preprocessors (SASS Basics)", x: 2520, y: 260, requires: 14, difficulty: "advanced" },
  { id: 24, title: "Modern Layout Systems Combined", x: 2640, y: 160, requires: 15, difficulty: "advanced" },
  { id: 25, title: "Final Professional CSS Project", x: 2760, y: 300, requires: 24, difficulty: "advanced" }

];