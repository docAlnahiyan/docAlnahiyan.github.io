# GitHub Organization Guide: docAlnahiyan

Audit date: 2026-10-08. Scope: profile and all 5 public repositories.

## 1. Current state

| Repo | Problems found |
|---|---|
| **docAlnahiyan.github.io** | Built files only, no source. Commit messages were all "Updates". The site still says "Master of Science, Expected 2025" and "Open to: PhD opportunities", which is out of date. *(SEO, favicon, README, 404, sitemap fixed in this branch.)* |
| **Parkinson-s-Disease-Recognition-Using-Hybrid-CNN-Transformer-Model** | Your strongest repo (MIT license). Long name with a stray `-s-`. No topics, no CITATION.cff, no paper link or weights. |
| **Global-Face-Net-Facial-for-expression-Recognition** | Garbled name ("Facial-for-expression"). No license. Description is chatty and includes an email address. |
| **MultimodalTransfomerNet-for-recognition-emotions-from-Audio-and-Image-data** | Typo ("Transfomer"). About **1 KB**, so it's effectively empty. No license, no description. |
| **Profile-Al-Nahiyan** | Holds only a CV PDF. Better kept as a release asset or on the website. |
| **Profile** | No profile README (repo `docAlnahiyan/docAlnahiyan`). No pinned repos. No bio. |

## 2. Priority actions (≈2 hours total)

### A. Profile (30 min), highest impact
1. Create the public repo **`docAlnahiyan/docAlnahiyan`** and paste [`profile-README.md`](profile-README.md).
2. Settings → Profile: set the **Bio** ("PhD researcher in AI @ SWJTU · Medical imaging · CNN-Transformers"), **Company** `@SWJTU` / Southwest Jiaotong University, **Website** `https://docalnahiyan.github.io`, and add ORCID + LinkedIn under *Social accounts*.
3. **Pin** the 3 research repos and the website.

### B. Rename repos (10 min)
GitHub sets up redirects automatically, so old links keep working. Then update the links on the website.

| Current | Suggested |
|---|---|
| Parkinson-s-Disease-Recognition-Using-Hybrid-CNN-Transformer-Model | `HybridTransMedFormer-Parkinsons-MRI` |
| Global-Face-Net-Facial-for-expression-Recognition | `GlobalFaceNet-FER` |
| MultimodalTransfomerNet-for-recognition-emotions-from-Audio-and-Image-data | `Multimodal-Emotion-Transformer` |
| Profile-Al-Nahiyan | archive it, or rename to `cv` |

### C. Every research repo (20 min each)
- One-line **About** description plus **topics**, e.g. `deep-learning` `medical-imaging` `parkinsons-disease` `mri` `vision-transformer` `pytorch` `explainable-ai` (FER: `facial-expression-recognition` `raf-db` `affective-computing`).
- **README** from [`research-repo-README-template.md`](research-repo-README-template.md): architecture figure, results table, how to run, BibTeX.
- **CITATION.cff** from [`CITATION.cff`](CITATION.cff), which adds a "Cite this repository" button.
- **LICENSE** (MIT, or Apache-2.0 for a patent grant) on the two repos that lack one.
- `requirements.txt` (or `environment.yml`) with pinned versions, plus `.gitignore` covering `*.pth`, `data/`, `runs/`, `wandb/`.
- **Never commit patient data** (PPMI terms forbid redistribution). Document how to request access instead.
- Put trained weights in a **GitHub Release** or on the **Hugging Face Hub**, not in git.
- Fill the MultimodalTransformer repo with code, or make it private until it's ready.

### D. Make the website maintainable
The live repo has only `dist/` output, so any content change needs your laptop.
Recommended setup:
1. Push the React/Vite source to the `main` branch of this repo (or a private `portfolio-src` repo).
2. Add `.github/workflows/deploy.yml` using `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`, then switch Settings → Pages → Source to **GitHub Actions**.
3. Move the site content (publications, projects) into a `src/data/*.json` file so updates don't touch components.
4. Content updates to make: **PhD at SWJTU** (status and dates), remove "Open to PhD opportunities", add a DOI link for the IARCE paper, and add Google Scholar once your profile exists.
5. Use meaningful commit messages: `feat: add 3D MRI fusion paper`, `fix: update CV link`.

## 3. What to build next as an AI researcher

**Visibility and credibility**
- **Zenodo DOI per release**: connect Zenodo to GitHub so each tagged release gets a citable DOI that's also linked to ORCID.
- **Hugging Face**: publish model weights with model cards, plus a **Gradio Space demo** (for example, upload an MRI slice and get a prediction with a Grad-CAM overlay). Reviewers and collaborators are more likely to try a live demo than to clone a repo.
- **Papers with Code**: link your paper to its repo so it shows up on dataset leaderboards (PPMI, RAF-DB).
- **Google Scholar** profile, linked from the website and GitHub.

**Research-engineering quality** (what PhD committees and labs notice)
- A shared template repo (`ml-research-template`) with Hydra/YAML configs, seeds, logging (W&B or TensorBoard), and a `Makefile`. Start every new paper from it.
- A small **CI** workflow (GitHub Actions): `ruff` lint plus a smoke test that runs one forward pass on random tensors. This catches broken code before reviewers do.
- Reproducibility: fixed seeds, a stated data split, a script that reproduces each table in the paper, and hardware and runtime notes.
- `pre-commit` with `ruff` and `nbstripout` to keep notebooks clean.

**New repo ideas that fit your PhD direction**
1. `awesome-parkinsons-ai`: a curated list of papers, datasets and code on PD detection. These lists are popular and establish you as the go-to person on the topic.
2. `mri-preprocessing-toolkit`: your NiBabel/skull-strip/registration pipeline packaged as a reusable tool.
3. `xai-medical-benchmarks`: Grad-CAM / attention-rollout comparisons on your models.
4. A **PhD research log or notes** repo (can be private): weekly progress, reading notes, experiment tracking.

## 4. Commit and branch conventions
- `main` = source, `gh-pages` = built site (or Actions deployment).
- Commit messages: `type: summary`, where type ∈ `feat`, `fix`, `docs`, `refactor`, `exp` (experiments), `data`.
- Tag the paper-version code: `git tag v1.0-iarce2024 && git push --tags`, then make a Release from that tag.
