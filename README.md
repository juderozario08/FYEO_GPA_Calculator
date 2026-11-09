# FYEO GPA Calculator

A grade and GPA calculator for Toronto Metropolitan University (TMU) engineering students, built for the **First-Year Engineering Office (FYEO)**. It uses TMU's 4.33 grading scale and saves everything in the student's browser, so there are no accounts and no data leaves their device.

**Live site:** https://fyeoapp.github.io/FYEO_GPA_Calculator/

> **You're on the `experimental` branch.** It has everything on `main` plus the [course grade breakdown](#experimental-course-grade-breakdown), which is still being tried out. Check out `main` for the stable version.

---

## Contents

- [Features](#features)
- [Experimental: course grade breakdown](#experimental-course-grade-breakdown)
- [How the calculations work](#how-the-calculations-work)
- [TMU grading scale](#tmu-grading-scale)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Styling](#styling)
- [Saved data (localStorage)](#saved-data-localstorage)
- [Updating links](#updating-links)
- [Deployment](#deployment)
- [Branches and remotes](#branches-and-remotes)
- [Contributing](#contributing)

---

## Features

The app has three calculators, shown as numbered tabs. The selected tab is remembered between visits.

### 1. Course Grade
Works out your current grade in a single course and what you need on the rest.

- Enter each assessment with a **grade (%)** and **weight (%)**. It starts with Assignment, Quizzes, Tutorials, Labs, Projects, Midterms and Final Exam, and you can rename, add or remove rows.
- Shows your **current average** with its letter grade and grade points, plus the **weight graded so far**.
- Set a **target grade** to see the average you need on the remaining weight. It also tells you when the target is already secured, can no longer be reached, or the course is complete.
- Warns when your weights don't add up to 100%.

### 2. Term GPA
Calculates your GPA for one term.

- Enter each course's **credits (billing units)** and **final percentage**.
- The letter grade and term GPA **update as you type**.
- Percentages outside 0–100 are highlighted and left out of the GPA.

### 3. Cumulative GPA
Shows how this term's grades would change your overall CGPA.

- Enter your **credits so far** and **current CGPA** from your transcript.
- Add this term's courses with the grade you expect in each.
- Shows the **new CGPA**, how much it would change (e.g. ▲ 0.32), this term's GPA and your total credits.
- **Repeated courses:** tick *Repeating this course* and choose the earlier grade. The new attempt replaces the old one instead of adding credits again.
- Flags a CGPA above 4.33, or repeat credits that exceed your prior credits.

### Also included
- **Resource sidebars:** links for academic resources, study support, advising and more. On smaller screens they move into a **Resources** menu.
- A collapsible **TMU grading scale** reference under each calculator.
- Links to the video tutorial, a feedback form and the **FYEng mobile app** (App Store and Google Play).
- Works on phones, keyboard-friendly (the tabs support the arrow keys), and asks before **Reset** clears anything.

---

## Experimental: course grade breakdown

> Only on the `experimental` branch.

This lets students split one Course Grade row into its parts. For example, *Labs (20%)* becomes Lab 1, Lab 2, … Lab 5.

**How to use it**
1. In the Course Grade tab, click the **list icon** next to a row.
2. Enter each part's **score** and what it was **out of** (e.g. `18 / 20`). Each part can have a different total.
3. The row's grade fills in automatically as the average of the graded parts.
4. Use **+ Add part** for more parts. **Remove breakdown** goes back to typing the grade by hand, and the grade you had typed before comes back.
5. Click the list icon again to collapse the parts. The row still shows how many are graded.

**Rules**
- **Every part counts equally** toward the row's weight. With 5 labs worth 20%, each is worth 4%.
- **Only the graded share counts as done.** With 3 of 5 labs marked, 12% of the 20% is complete and the other 8% stays in the remaining weight. That keeps the *"you need X% on the rest"* message accurate partway through the term.

**Example**

| Row | Details | Result |
|---|---|---|
| Labs (20%) | 18/20, 8/10, 70/100, *ungraded*, *ungraded* | Average 80%, 3/5 graded → 12% complete |
| Midterm (30%) | 70% | 30% complete |
| Final Exam (50%) | *ungraded* | — |
| **Total** | | **Current average 72.86%** on 42% graded; **76.6%** needed on the remaining 58% to reach 75% |

**Possible next steps:** weighting parts differently, dropping the lowest part (e.g. lowest quiz), and saving breakdowns for several courses.

The code is in `src/lib/parts.js` (the math) and `src/components/CourseGradeCalc.jsx` (the UI). Parts are stored on the existing Course Grade rows, so builds from `main` simply ignore them.

---

## How the calculations work

All the math happens in the browser as you type.

**Course Grade**
```
current average  = Σ(grade × weight) / Σ(weight of graded rows)
required average = (target − points earned so far) / remaining weight × 100
remaining weight = 100 − weight graded
```

**Term GPA**
```
term GPA = Σ(credits × grade points) / Σ(credits)
```
A course counts only when it has a valid percentage and more than 0 credits.

**Cumulative GPA**
```
new CGPA = (prior credits × prior CGPA + this term's points − replaced points) / (prior credits + new credits)
```
- Credits for a **repeated** course are already included in *prior credits*, so they aren't added again.
- Instead, the old attempt's grade points (*replaced points*) are removed, which matches TMU's repeat policy.

Results are **estimates**; a student's official GPA is the one on their transcript.

---

## TMU grading scale

Defined in `src/lib/grades.js` (Senate Policy 170).

| Letter | Percent | Points | | Letter | Percent | Points |
|---|---|---|---|---|---|---|
| A+ | 90–100 | 4.33 | | C | 63–66 | 2.00 |
| A  | 85–89 | 4.00 | | C- | 60–62 | 1.67 |
| A- | 80–84 | 3.67 | | D+ | 57–59 | 1.33 |
| B+ | 77–79 | 3.33 | | D | 53–56 | 1.00 |
| B  | 73–76 | 3.00 | | D- | 50–52 | 0.67 |
| B- | 70–72 | 2.67 | | F | 0–49 | 0.00 |
| C+ | 67–69 | 2.33 | | | | |

---

## Getting started

**You'll need** [Node.js](https://nodejs.org/) version 20.19 or newer (or 22.12+), plus npm.

```bash
git clone https://github.com/juderozario08/FYEO_GPA_Calculator.git
cd FYEO_GPA_Calculator
npm install
npm run dev
```

Open the address it prints. Note the path: it's **http://localhost:5173/FYEO_GPA_Calculator/**, not just `localhost:5173`.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server; the page reloads as you edit |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally to check it |
| `npm run lint` | Runs ESLint |
| `npm run deploy` | Builds the site and publishes `dist/` to GitHub Pages |

**Built with** React 19, Vite 8, Tailwind CSS 4 and ESLint, with no backend.

---

## Project structure

```
├── index.html               # Page shell, fonts, favicon, meta tags
├── public/                  # Images served as-is (logos, app-store badges, favicon)
├── src/
│   ├── main.jsx             # Entry point
│   ├── App.jsx              # Layout: header, tabs, sidebars, footer
│   ├── index.css            # Tailwind setup, theme colours, shared component classes
│   ├── components/
│   │   ├── CourseGradeCalc.jsx    # Tab 1 (and the experimental breakdown)
│   │   ├── TermGpaCalc.jsx        # Tab 2
│   │   ├── CumulativeGpaCalc.jsx  # Tab 3
│   │   ├── Sidebar.jsx            # Desktop sidebars and mobile Resources menu
│   │   └── ui.jsx                 # Shared pieces: stat tiles, callouts, grading-scale table
│   ├── data/
│   │   └── links.js         # All sidebar, tutorial, feedback and app-store links
│   ├── hooks/
│   │   └── useLocalStorage.js  # Saves state to the browser; recovers from bad data
│   └── lib/
│       ├── grades.js        # TMU scale, percent → letter, number helpers
│       ├── parts.js         # Experimental breakdown math
│       ├── confirm.js       # "Clear everything?" prompt for Reset
│       └── id.js            # Unique row IDs (works over plain http too)
└── vite.config.js           # Sets base: '/FYEO_GPA_Calculator/' for GitHub Pages
```

`src/App1.jsx`, `src/App2.jsx` and `src/assets/` are older drafts and template files that nothing uses. They can be deleted.

---

## Styling

The look matches FYEO's other tools (the Engineering Course Planning Calculator and the CEN100 Assignment Calculator). The theme colours are defined once in `src/index.css` and used as Tailwind classes, e.g. `bg-brand` or `text-accent`.

| Token | Colour | Used for |
|---|---|---|
| `brand` | `#8a24a8` | Header bar |
| `accent` | `#a009d7` | Highlights, focus rings, active tab |
| `sun` | `#ffe14d` | Primary (yellow) buttons |
| `royal` | `#1857b8` | Secondary (blue) buttons |
| `card` | `#676cbc` | Calculator cards |
| `sidebar` | `#e7ecff` | Sidebars, chips |
| `panel` | `#f7f7fa` | Input backgrounds |

The same file defines shared classes such as `.btn`, `.btn-yellow`, `.btn-blue`, `.section-card`, `.panel`, `.field`, `.stat`, `.callout-*` and `.sidebar-card`. Change those to restyle the whole app at once. The font is **Inter**, loaded from Google Fonts in `index.html`.

---

## Saved data (localStorage)

Everything a student enters is saved in their own browser and nothing is sent anywhere. Clearing site data or using a private window starts fresh.

| Key | Contents |
|---|---|
| `active-calc-tab` | Last open tab (`course`, `term` or `cumulative`) |
| `course-target` | Course Grade target % |
| `course-assignments` | Course Grade rows (plus `parts` / `showParts` on `experimental`) |
| `term-courses` | Term GPA rows |
| `cumulative-past` | Credits so far and current CGPA |
| `cumulative-courses` | Cumulative GPA rows |

**Keep these key names the same.** Renaming one would wipe what students have already saved. If saved data is corrupt or the wrong shape, the app falls back to defaults instead of crashing.

---

## Updating links

All outbound links are in **`src/data/links.js`**:

- `leftGroups` / `rightGroups`: the sidebar sections. Each has a `title`, an `icon` (emoji) and a `variant` (`'yellow'` or `'blue'`), plus a list of `{ label, url }` links.
- `TUTORIAL_URL`, `FEEDBACK_URL`, `GOOGLE_PLAY_URL`, `APP_STORE_URL`

The desktop sidebars and the mobile Resources menu both read from this file, so you only edit it in one place.

---

## Deployment

The site is hosted on **GitHub Pages** using the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package:

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch of whichever repo `origin` points to.

- From the FYEO repo it publishes to `https://fyeoapp.github.io/FYEO_GPA_Calculator/`.
- From a fork it publishes to `https://<your-username>.github.io/FYEO_GPA_Calculator/`.

The first time, enable Pages for the repo: **Settings → Pages → Branch: `gh-pages`**.

`vite.config.js` sets `base: '/FYEO_GPA_Calculator/'`, so the repo must keep that exact name or images and scripts won't load. If the repo is renamed, update `base`, and the `homepage` field in `package.json` too.

---

## Branches and remotes

| Branch | Purpose |
|---|---|
| `main` | Stable version |
| `experimental` | `main` plus features still being tried out (currently the grade breakdown) |

For a fork set up with FYEO's repo as `upstream`:

```bash
git remote -v                 # origin = your fork, upstream = fyeoapp/FYEO_GPA_Calculator
git pull upstream main        # bring in FYEO's latest changes
git push                      # push the current branch to your fork
```

To move the experimental work into `main` once it's ready, open a pull request from `experimental` into `main`. To offer it to FYEO, open one from your fork to `fyeoapp/FYEO_GPA_Calculator`.

---

## Contributing

1. Create a branch from `main` (or from `experimental` for experimental features).
2. Run `npm run lint` and `npm run build` before pushing.
3. Check your change on a phone-sized window as well as on desktop.
4. Don't rename any of the [saved-data keys](#saved-data-localstorage).
5. Open a pull request describing what changed.

**Feedback or bugs?** Use the [feedback form](https://docs.google.com/forms/d/e/1FAIpQLSfS4v2l6lEqOK0W6YOXI9i7LfQWM0HXT0mshs7-waxhV2aeRQ/viewform?usp=publish-editor) or open an issue.

---

© First-Year Engineering Office · Toronto Metropolitan University
