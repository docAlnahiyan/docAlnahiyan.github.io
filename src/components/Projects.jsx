import React from 'react';
import { Brain, Heart, ShoppingCart, Shield, Bird, Github, ExternalLink, Code, Database, Award } from 'lucide-react';

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "MultimodalTransformerNet",
      subtitle: "Emotion Recognition from Audio and Image Data",
      description: "Cross-modal attention fusion framework combining visual and 39-dimensional auditory features achieving transformative 99.7% accuracy and AUC 1.000 on balanced datasets. Demonstrates 14.7 percentage point improvement over unimodal approaches.",
      icon: Heart,
      color: "emerald",
      github: "https://github.com/docAlnahiyan/MultimodalTransfomerNet-for-recognition-emotions-from-Audio-and-Image-data",
      tags: ["PyTorch", "Transformers", "Audio Processing", "Computer Vision", "Multimodal AI"],
      metrics: [
        { label: "Accuracy", value: "99.7%" },
        { label: "AUC", value: "1.000" }
      ],
      category: "research"
    },
    {
      id: 2,
      title: "GlobalFaceNet",
      subtitle: "Facial Expression Recognition",
      description: "Novel CNN-Transformer hybrid architecture for unimodal emotion recognition. First dual-pathway processing approach integrating fine-grained facial details with global spatial context, achieving 85.0% accuracy on RAF-DB dataset with fast 3.2ms inference time.",
      icon: Heart,
      color: "blue",
      github: "https://github.com/docAlnahiyan/Global-Face-Net-Facial-for-expression-Recognition",
      tags: ["PyTorch", "CNN-Transformer", "Face Recognition", "Deep Learning", "RAF-DB"],
      metrics: [
        { label: "Accuracy", value: "85.0%" },
        { label: "Inference", value: "3.2ms" }
      ],
      category: "research"
    },
    {
      id: 3,
      title: "Hybrid Deep Learning for Parkinson's Disease",
      subtitle: "Master's Thesis - 2D and 3D MRI Innovations",
      description: "Two-tier diagnostic pipeline using structural MRI: lightweight Hybrid CNN-Transformer (80.51% accuracy) for 2D rapid pre-screening, and robust HybridTransMedFormer (92.34% accuracy) 3D dual-path fusion architecture for confirmatory diagnosis. Reduces diagnostic delays by 12-18 months.",
      icon: Brain,
      color: "emerald",
      tags: ["3D MRI", "CNN-Transformer", "Medical AI", "PyTorch", "Grad-CAM", "PPMI Dataset"],
      metrics: [
        { label: "2D Model", value: "80.51%" },
        { label: "3D Model", value: "92.34%" }
      ],
      award: "Best Paper Award - IARCE 2024",
      category: "thesis"
    },
    {
      id: 4,
      title: "Bird Species Identification",
      subtitle: "Bachelor's Thesis - Deep Neural Networks",
      description: "Image recognition system for bird species identification using Transfer Learning with pre-trained VGG-16 and ResNet18 architectures on Caltech-UCSD Birds 200 (CUB-200-2011) dataset. Complete pipeline including image pre-processing, data augmentation, and model comparison.",
      icon: Bird,
      color: "amber",
      tags: ["PyTorch", "Transfer Learning", "VGG-16", "ResNet18", "NumPy", "CUB-200"],
      date: "May 2021",
      category: "thesis"
    },
    {
      id: 5,
      title: "COVID-19 Facemask Detection",
      subtitle: "Deep Learning for Safety Compliance",
      description: "Trained a Convolutional Neural Network (CNN) model to accurately identify the presence or absence of facemasks on individuals in images and video streams. Real-time detection system for public health safety monitoring.",
      icon: Shield,
      color: "red",
      tags: ["CNN", "OpenCV", "Real-time Detection", "Computer Vision", "TensorFlow"],
      date: "June 2021",
      category: "application"
    },
    {
      id: 6,
      title: "AI-Driven E-Commerce Platform",
      subtitle: "Intern Project - Recommendation Engine",
      description: "Contributed to the development of an e-commerce platform incorporating an AI-driven recommendation engine based on user history and real-time browsing behavior. Implemented collaborative filtering and content-based recommendation algorithms.",
      icon: ShoppingCart,
      color: "purple",
      tags: ["Machine Learning", "Recommendation System", "Python", "Flask", "SQL"],
      date: "January 2021",
      category: "internship"
    }
  ];

  const colorClasses = {
    emerald: {
      bg: "from-emerald-50 to-emerald-100",
      icon: "bg-emerald-600",
      border: "border-emerald-200",
      text: "text-emerald-700",
      hover: "hover:border-emerald-400"
    },
    blue: {
      bg: "from-blue-50 to-blue-100",
      icon: "bg-blue-600",
      border: "border-blue-200",
      text: "text-blue-700",
      hover: "hover:border-blue-400"
    },
    amber: {
      bg: "from-amber-50 to-amber-100",
      icon: "bg-amber-600",
      border: "border-amber-200",
      text: "text-amber-700",
      hover: "hover:border-amber-400"
    },
    red: {
      bg: "from-red-50 to-red-100",
      icon: "bg-red-600",
      border: "border-red-200",
      text: "text-red-700",
      hover: "hover:border-red-400"
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      icon: "bg-purple-600",
      border: "border-purple-200",
      text: "text-purple-700",
      hover: "hover:border-purple-400"
    }
  };

  const getCategoryBadge = (category) => {
    switch(category) {
      case 'research':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Research</span>;
      case 'thesis':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Thesis</span>;
      case 'application':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Application</span>;
      case 'internship':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Internship</span>;
      default:
        return null;
    }
  };

  return (
    <section id="projects" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-6">
            <Code className="w-4 h-4" />
            Portfolio
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Projects & Research
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI/ML projects spanning medical imaging, emotion recognition, and practical applications
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">6</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">2</div>
              <div className="text-sm text-gray-600">Thesis Works</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700">4</div>
              <div className="text-sm text-gray-600">Research Papers</div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {projects.map((project) => {
            const colors = colorClasses[project.color];
            const Icon = project.icon;
            
            return (
              <div 
                key={project.id}
                className={`bg-gradient-to-br ${colors.bg} rounded-2xl border-2 ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden`}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${colors.icon} rounded-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getCategoryBadge(project.category)}
                      {project.award && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                          <Award className="w-3 h-3" />
                          Award
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className={`text-sm font-semibold ${colors.text} mb-4`}>
                    {project.subtitle}
                  </p>

                  {/* Date if available */}
                  {project.date && (
                    <p className="text-xs text-gray-500 mb-4">{project.date}</p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Award Banner if present */}
                  {project.award && (
                    <div className="mb-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-bold text-yellow-800">{project.award}</span>
                      </div>
                    </div>
                  )}

                  {/* Metrics if available */}
                  {project.metrics && (
                    <div className="flex gap-3 mb-6">
                      {project.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                          <div className="text-xs text-gray-600">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {project.github && (
                    <div className="flex gap-3">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex-1 justify-center"
                      >
                        <Github className="w-4 h-4" />
                        View Code
                      </a>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-white ${colors.text} font-semibold rounded-lg border-2 ${colors.border} hover:bg-gray-50 transition-all`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technologies Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Technical Skills & Tools
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-200 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <div className="font-bold text-gray-900 mb-2">Deep Learning</div>
              <div className="text-xs text-gray-600">PyTorch, TensorFlow, Keras</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 text-center">
              <div className="text-3xl mb-2">👁️</div>
              <div className="font-bold text-gray-900 mb-2">Computer Vision</div>
              <div className="text-xs text-gray-600">OpenCV, Scikit-image, NiBabel</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 text-center">
              <div className="text-3xl mb-2">🏗️</div>
              <div className="font-bold text-gray-900 mb-2">Architectures</div>
              <div className="text-xs text-gray-600">CNN, Transformers, Hybrids</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-200 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold text-gray-900 mb-2">Deployment</div>
              <div className="text-xs text-gray-600">Docker, FastAPI, Flask</div>
            </div>
          </div>
        </div>

        {/* GitHub CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Interested in my work? Check out more projects on GitHub
          </p>
          <a
            href="https://github.com/docAlnahiyan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all hover:shadow-xl"
          >
            <Github className="w-5 h-5" />
            Visit GitHub Profile
          </a>
        </div>
      </div>
    </section>
  );
}