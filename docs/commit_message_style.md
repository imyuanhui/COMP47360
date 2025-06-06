# Git Commit Message Style 



###  Recommended Structure

```
<type>: <brief description>

[optional body: what & why]

[optional footer: issue links, co-authors, etc.]
```

---

###  Common Commit Types

| Type        | When to use                                | Example                        |
|-------------|---------------------------------------------|--------------------------------|
| `feat`      | ✨ A new feature                             | `feat: add map search bar`     |
| `fix`       | 🐞 A bug fix                                | `fix: correct station marker color` |
| `refactor`  | 🔧 Code refactoring (no features/bugs)      | `refactor: simplify login flow` |
| `style`     | 🎨 UI/styling changes (no logic affected)   | `style: adjust card spacing`   |
| `docs`      | 📚 Documentation only changes               | `docs: update README for setup`|
| `test`      | ✅ Add or modify tests                      | `test: add unit test for planner` |
| `chore`     | 🔩 Maintenance tasks (e.g., deps, config)   | `chore: update .gitignore`     |

---

###  Examples

```bash
feat: implement weather chart on plans page

fix: resolve crash on login due to null session

docs: add team collaboration guide

refactor: extract api call into separate utils

style: unify button font size across pages

test: add model evaluation test case

chore: configure GitHub PR template
```

---

### Notes

- Use **present tense**: "add", not "added" or "adds"
- Keep summary line under **50 characters**
- Capitalize the type prefix (`feat`, `fix`, etc.)
- Add body only if necessary to explain complex changes
- ❌ Avoid vague messages like `update code`, `fix stuff`, `temp`

