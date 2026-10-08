---
title: Parkinson's recognition with a hybrid CNN–Transformer on 2D MRI
slug: parkinsons-hybrid-cnn-transformer-2d
subtitle: A lightweight model for rapid pre-screening, and winner of the IARCE 2024 Best Paper Award.
short_summary: >-
  Combines CNN and Transformer features to classify Parkinson's disease from 2D MRI slices.
  It is designed to be fast and cheap enough to serve as a first-pass screening tool in
  resource-constrained clinical settings.
tags: [2D MRI, Best paper]
status: published
publication: parkinsons-hybrid-cnn-transformer-2d
thumbnail: ""
metrics:
  - { label: accuracy, value: 80.51% }
  - { label: input, value: 2D MRI slices }
links: {}
featured: false
walkthrough: ""
order: 2
---

A lightweight hybrid model for rapid pre-screening from 2D MRI slices. A CNN backbone
extracts local features from each slice, and Transformer attention models the spatial
relationships between them before a classification head separates Parkinson's disease from
healthy controls.

Because it works on 2D slices rather than full 3D volumes, it is quick to run and suited to
first-pass screening. It forms the 2D half of my Master's thesis; cases it flags can go on to
the [3D HybridTransMedFormer](/research/hybridtransmedformer/) for confirmatory analysis.
