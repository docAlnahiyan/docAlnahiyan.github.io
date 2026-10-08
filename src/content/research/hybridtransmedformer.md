---
title: "HybridTransMedFormer: a dual-path 3D MRI framework for early Parkinson's detection"
slug: hybridtransmedformer
subtitle: A CNN + Transformer model that reads 3D brain scans and flags the disease in its prodromal stage.
short_summary: >-
  Most models need several types of scan to diagnose Parkinson's. This one works from a
  single 3D T1-weighted MRI by running two paths at once — a convolutional path for fine
  local detail around the substantia nigra, and a Transformer path for whole-brain
  context — then fusing them, so it can separate healthy, prodromal and Parkinson's brains.
tags: [3D MRI, Thesis]
status: under-review
publication: hybridtransmedformer
thumbnail: ""
metrics:
  - { label: accuracy, value: 92.34% }
  - { label: ROC AUC, value: "0.984" }
  - { label: prodromal acc., value: 96.85% }
  - { label: prodromal AUC, value: "0.994" }
links: {}
featured: true
walkthrough: hybridtransmedformer
order: 1
---

Early Parkinson's is hard to catch because the clearest signs appear only after irreversible
damage. HybridTransMedFormer reads a single 3D T1-weighted MRI and combines local
convolutional features with global self-attention to separate healthy, prodromal, and
Parkinson's brains — reaching the prodromal stage 2–3 years before motor symptoms.

## What's new

- **One scan, no extra modalities.** The model works from structural MRI alone, without the
  multi-modal inputs most early-stage approaches depend on.
- **Two paths, fused dynamically.** A CNN path captures fine local structure such as
  substantia nigra atrophy; a Transformer path captures cortical–subcortical dependencies
  across the whole brain. Cross-pathway fusion lets each path weight the other instead of
  simply concatenating them.
- **Built for an imbalanced cohort.** Trained on the PPMI dataset with anatomically
  constrained 3D augmentation and focal loss to cope with uneven class sizes.
- **Interpretable.** Grad-CAM maps show the model attending to regions associated with
  Parkinson's pathology.

This work forms the 3D, confirmatory half of my Master's thesis; the
[2D pre-screening model](/research/parkinsons-hybrid-cnn-transformer-2d/) is the other half.
