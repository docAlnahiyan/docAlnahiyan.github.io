---
title: MultimodalTransformerNet
slug: multimodal-transformer-net
one_liner: Emotion recognition that fuses facial images and speech audio with cross-modal attention.
tags: [Multimodal, Emotion recognition, Audio, PyTorch]
repo_url: https://github.com/docAlnahiyan/MultimodalTransfomerNet-for-recognition-emotions-from-Audio-and-Image-data
thumbnail: ""
metrics:
  - { label: accuracy, value: 99.7% }
  - { label: AUC, value: "1.000" }
date: 2025-06-01
order: 1
---

A multimodal framework that combines visual features from facial images with 39-dimensional
auditory features. Cross-modal attention lets each modality inform how the other is read,
rather than simply concatenating the two feature sets.

Combining both inputs improved accuracy by 14.7 percentage points over the best single-input
model. Results were measured on class-balanced datasets.
