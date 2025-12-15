import React, { useState } from 'react';
import { BookOpen, Award, ExternalLink, Github, Copy, Check, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';

export default function Publications() {
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [copiedBibtex, setCopiedBibtex] = useState(null);

  const copyBibtex = (bibtex, id) => {
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(id);
    setTimeout(() => setCopiedBibtex(null), 2000);
  };

  const publications = [
    {
      id: 1,
      title: "HybridTransMedFormer: A Dual-Path 3D MRI Fusion Framework for Early Parkinson's Disease Recognition",
      authors: "Khushbu A N, Zhang X, et al.",
      journal: "Artificial Intelligence in Medicine",
      year: "2025",
      status: "under-review",
      statusText: "Under Review",
      abstract: `The early detection of Parkinson's disease (PD) at the prodromal stage, when neuroprotective therapies could substantially delay progression, remains a critical challenge in neurology. We introduce HybridTransMedFormer, a dual-path 3D MRI fusion framework that synergizes hierarchical convolutional networks and self-attention transformers to address this gap. Unlike existing hybrids, our architecture employs dynamic cross-pathway fusion to adaptively integrate localized structural details (e.g., substantia nigra atrophy) with global cortical-subcortical dependencies, establishing the first 3D MRI framework for early-stage PD classification without requiring multi-modal data.

Trained on the Parkinson's Progression Markers Initiative (PPMI) dataset, HybridTransMedFormer overcomes severe class imbalance (Control: 131, PD: 318, Prodromal: 110) via anatomically constrained 3D augmentations (rotation ±10°, intensity shifts, Gaussian noise) and Focal Loss optimization (γ = 2.5), balancing classes to 497 samples each. The model achieves state-of-the-art performance: 92.34% accuracy, 0.984 ROC AUC, and 0.974 PR AUC, surpassing six benchmarks including 3DTransMeD (+4.95% accuracy) and SwinTransformer3D (+18.47% accuracy).

For prodromal detection—the most clinically critical task—it attains 96.85% accuracy, 95.85% precision, 94.61% recall, and 0.994 ROC AUC, demonstrating unprecedented sensitivity to early-stage neurodegeneration. Grad-CAM visualizations reveal clinically interpretable decision-making, with attention maps localized to PD-pathology regions (substantia nigra, p < 0.001 via McNemar, bootstrapping). By reducing diagnostic delays by 12–18 months, this framework identifies neurodegeneration 2–3 years before motor symptom onset, enabling timely intervention. Code, preprocessing pipelines, and model weights are open-sourced to ensure reproducibility.`,
      metrics: [
        { label: "Accuracy", value: "92.34%" },
        { label: "ROC AUC", value: "0.984" },
        { label: "PR AUC", value: "0.974" },
        { label: "Prodromal Acc.", value: "96.85%" }
      ],
      keywords: ["Parkinson's Disease", "3D MRI", "Hybrid CNN-Transformer", "Early Detection", "Medical AI", "Deep Learning"],
      bibtex: `@article{khushbu2025hybridtransmedformer,
  title={HybridTransMedFormer: A Dual-Path 3D MRI Fusion Framework for Early Parkinson's Disease Recognition},
  author={Khushbu, Al-Nahiyan and Zhang, X and others},
  journal={Artificial Intelligence in Medicine},
  year={2025},
  note={Under Review}
}`
    },
    {
      id: 2,
      title: "Parkinson's Disease Recognition Using Hybrid CNN-Transformer Model",
      authors: "Khushbu A N, Yang Z, Liu Y, Zhang X",
      conference: "2024 4th International Conference on Industrial Automation, Robotics and Control Engineering (IARCE 2024)",
      year: "2024",
      pages: "pp. 307-311",
      doi: "10.1109/IARCE64300.2024.00064",
      status: "published",
      statusText: "Published",
      award: "Best Paper Award",
      github: "https://github.com/docAlnahiyan/Parkinson-s-Disease-Recognition-Using-Hybrid-CNN-Transformer-Model",
      abstract: `This paper presents a novel hybrid architecture combining Convolutional Neural Networks (CNNs) with Transformer attention mechanisms for Parkinson's disease classification using 2D structural MRI. The proposed model leverages the feature extraction capabilities of CNNs while incorporating the global context modeling of Transformers to achieve improved classification performance. Our lightweight model provides rapid pre-screening capabilities for early PD detection, achieving 80.51% accuracy on structural brain MRI data. The hybrid approach demonstrates the effectiveness of combining local feature extraction with global attention mechanisms for medical image analysis, offering a computationally efficient solution suitable for clinical deployment in resource-constrained settings.`,
      metrics: [
        { label: "Accuracy", value: "80.51%" },
        { label: "Model Type", value: "2D Hybrid" },
        { label: "Inference", value: "Fast" }
      ],
      keywords: ["Parkinson's Disease", "CNN-Transformer", "Medical Imaging", "Deep Learning", "2D MRI"],
      links: [
        { type: "DOI", url: "https://doi.org/10.1109/IARCE64300.2024.00064", icon: ExternalLink },
        { type: "GitHub", url: "https://github.com/docAlnahiyan/Parkinson-s-Disease-Recognition-Using-Hybrid-CNN-Transformer-Model", icon: Github }
      ],
      bibtex: `@inproceedings{khushbu2024parkinsons,
  title={Parkinson's Disease Recognition Using Hybrid CNN-Transformer Model},
  author={Khushbu, Al-Nahiyan and Yang, Z and Liu, Y and Zhang, X},
  booktitle={2024 4th International Conference on Industrial Automation, Robotics and Control Engineering (IARCE 2024)},
  pages={307--311},
  year={2024},
  organization={IEEE},
  doi={10.1109/IARCE64300.2024.00064},
  note={Best Paper Award}
}`
    }
  ];

  return (
    <section id="publications" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Academic Publications
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Publications
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Peer-reviewed research advancing medical AI and early disease detection
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">2</div>
              <div className="text-sm text-gray-600">Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">1</div>
              <div className="text-sm text-gray-600">Best Paper Award</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">IEEE & Elsevier</div>
              <div className="text-sm text-gray-600">Conference & Journal</div>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-8">
          {publications.map((pub, index) => (
            <div 
              key={pub.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Publication Header */}
              <div className="p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {pub.title}
                    </h3>
                    
                    {/* Authors */}
                    <p className="text-base text-gray-700 mb-2">{pub.authors}</p>
                    
                    {/* Venue */}
                    <p className="text-sm text-gray-600 mb-3">
                      {pub.journal && <span className="font-semibold italic">{pub.journal}</span>}
                      {pub.conference && <span className="font-semibold">{pub.conference}</span>}
                      {pub.pages && <span>, {pub.pages}</span>}
                      <span className="ml-2">({pub.year})</span>
                    </p>

                    {/* DOI */}
                    {pub.doi && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">DOI:</span>{' '}
                        <a 
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 underline"
                        >
                          {pub.doi}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col gap-2">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold text-center whitespace-nowrap ${
                      pub.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pub.statusText}
                    </div>
                    {pub.award && (
                      <div className="px-3 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-full text-xs font-bold text-yellow-800 flex items-center gap-1 whitespace-nowrap">
                        <Award className="w-4 h-4" />
                        {pub.award}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {pub.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                      <span className="text-sm font-bold text-emerald-700">{metric.value}</span>
                      <span className="text-xs text-gray-600 ml-2">{metric.label}</span>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {pub.keywords.map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* Abstract Toggle */}
                <button
                  onClick={() => setExpandedAbstract(expandedAbstract === pub.id ? null : pub.id)}
                  className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold text-sm mb-4"
                >
                  {expandedAbstract === pub.id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Abstract
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Abstract
                    </>
                  )}
                </button>

                {/* Abstract Content */}
                {expandedAbstract === pub.id && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Abstract
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {pub.abstract}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Links (DOI, GitHub, etc.) */}
                  {pub.links && pub.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.type}
                    </a>
                  ))}

                  {/* BibTeX Copy Button */}
                  <button
                    onClick={() => copyBibtex(pub.bibtex, pub.id)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all"
                  >
                    {copiedBibtex === pub.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy BibTeX
                      </>
                    )}
                  </button>
                </div>

                {/* BibTeX Preview (Always visible) */}
                <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono">{pub.bibtex}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Citation Format Note */}
        <div className="mt-12 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            Citation Formats
          </h3>
          <p className="text-sm text-gray-700">
            BibTeX citations are provided for easy reference. Click "Copy BibTeX" to copy the citation to your clipboard. 
            All publications are formatted according to IEEE standards.
          </p>
        </div>

        {/* Research Impact */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-emerald-700 mb-2">92.34%</div>
            <div className="text-sm text-gray-600">Highest Accuracy Achieved</div>
            <div className="text-xs text-gray-500 mt-1">HybridTransMedFormer</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-emerald-700 mb-2">12-18</div>
            <div className="text-sm text-gray-600">Months Earlier Detection</div>
            <div className="text-xs text-gray-500 mt-1">Clinical Impact</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-emerald-700 mb-2">SOTA</div>
            <div className="text-sm text-gray-600">State-of-the-Art Results</div>
            <div className="text-xs text-gray-500 mt-1">Surpassed 6 Benchmarks</div>
          </div>
        </div>

      </div>
    </section>
  );
}