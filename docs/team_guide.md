# SmartTour NYC Git Collaboration Guide

---

### 🔧 Project Structure

```
COMP47360/
├── frontend/       # React frontend
├── backend/        # Spring Boot backend
├── data/           # Python scripts and ML models
├── docs/           # Documentation and API specs
├── .github/        # GitHub templates
├── .gitignore
└── README.md
```

---

### Branch Strategy

| Branch Name | Purpose                                 |
| ----------- | --------------------------------------- |
| `main`      | Production branch (stable release only) |
| `dev`       | Main development branch (default)       |
| `feature/*` | New feature development                 |
| `fix/*`     | Bug fixing branches                     |
| `data/*`    | Data preprocessing or modeling          |
| `test/*`    | Experimental/testing branches           |

---

### Feature-based Branching

| Branch Name           | Purpose            | Area     |
| --------------------- | ------------------ | -------- |
| `feature/login-page`  | Login UI page      | frontend |
| `feature/login-api`   | User auth API      | backend  |
| `data/train-busyness` | Train ML model     | data     |
| `fix/weather-api`     | Fix forecast error | backend  |

- Everyone branches from `dev`, works independently, and submits PRs **back to `dev`**.
- `main` is used for **release & deployment only**.
- Only the maintainer merges `dev → main` after testing.

---

### Branch Naming Convention

| Type      | Examples                                   |
| --------- | ------------------------------------------ |
| Feature   | `feature/login-page`, `feature/search-map` |
| Bug Fix   | `fix/button-style`, `fix/route-crash`      |
| Data Task | `data/clean-poi`, `data/train-model-v1`    |

---

### Development Workflow

#### Step 1: Create a Feature Branch from `dev`

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

#### Step 2: Develop and Commit

```bash
git add .
git commit -m "Add login form component"
git push origin feature/your-feature-name
```

#### Step 3: Submit Pull Request (PR)

- Go to GitHub repository page
- Click "Compare & Pull Request"
- Base branch: `dev`
- Fill in PR template
- Tag a maintainer to review

---

### After PR Approval

- PR is merged into `dev`
- Maintainer periodically merges `dev → main` for stable release

---

### Maintainer Tips

```bash
# Merge dev into main for release
git checkout main
git pull
git merge dev
git push origin main
```

---

### Set `dev` as Default Branch (once)

- GitHub → Repository → Settings → Branches → Default Branch → `dev`

---


### Notes

- Use GitHub Issues for all tasks
- Submit all changes through Pull Requests
- Use meaningful commit messages (e.g., `Add`, `Fix`, `Update`)
