---
title: GlobalFaceNet
slug: globalfacenet
one_liner: A CNN–Transformer hybrid for recognising emotion from facial expressions.
tags: [Emotion recognition, CNN-Transformer, RAF-DB, TensorFlow/Keras]
repo_url: https://github.com/docAlnahiyan/Global-Face-Net-Facial-for-expression-Recognition
thumbnail: ""
metrics:
  - { label: accuracy on RAF-DB, value: 85.0% }
  - { label: inference, value: 3.2 ms }
date: 2025-04-01
order: 2
---

A dual-pathway architecture for single-input (image-only) emotion recognition. One path
captures fine-grained facial detail, the other global spatial context, and the two are
combined before classification. Evaluated on the RAF-DB facial expression dataset.
