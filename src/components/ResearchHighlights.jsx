import React from 'react';
import { Brain, Award, TrendingUp, Zap, Eye, ExternalLink, Github, BookOpen } from 'lucide-react';

export default function ResearchHighlights() {
  return (
    <section id="research" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Featured Research
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Research Highlights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Novel hybrid CNN-Transformer architectures advancing early Parkinson's disease detection
          </p>
        </div>

        {/* Main Research Projects */}
        <div className="space-y-12">
          
          {/* Project 1: HybridTransMedFormer (Under Review - Most Advanced) */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 lg:p-12 border border-emerald-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 rounded-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-emerald-700 font-semibold">Master's Thesis Research</div>
                    <div className="text-xs text-gray-500">Expected 2025</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    HybridTransMedFormer
                  </h3>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    Under Review
                  </div>
                </div>
                
                <p className="text-lg font-semibold text-gray-800">
                  A Dual-Path 3D MRI Fusion Framework for Early Parkinson's Disease Recognition
                </p>

                <p className="text-base text-gray-700 leading-relaxed">
                  The early detection of Parkinson's disease at the prodromal stage remains a critical challenge in neurology. 
                  HybridTransMedFormer introduces a dual-path 3D MRI fusion framework that synergizes hierarchical convolutional 
                  networks and self-attention transformers. Our architecture employs dynamic cross-pathway fusion to adaptively 
                  integrate localized structural details with global cortical-subcortical dependencies.
                </p>

                {/* Key Innovations */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">First 3D MRI Framework</div>
                      <div className="text-sm text-gray-600">Early-stage PD classification without requiring multi-modal data</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Dynamic Cross-Pathway Fusion</div>
                      <div className="text-sm text-gray-600">Integrates substantia nigra atrophy with cortical-subcortical dependencies</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Clinical Impact</div>
                      <div className="text-sm text-gray-600">Reduces diagnostic delays by 12-18 months, identifies neurodegeneration 2-3 years before motor symptom onset</div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">92.34%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">0.984</div>
                    <div className="text-xs text-gray-600">ROC AUC</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">96.85%</div>
                    <div className="text-xs text-gray-600">Prodromal Acc.</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">0.994</div>
                    <div className="text-xs text-gray-600">Prodromal AUC</div>
                  </div>
                </div>

                {/* Performance Comparison */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-sm font-semibold text-gray-800 mb-3">Outperforms State-of-the-Art:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">vs 3DTransMeD</span>
                      <span className="font-bold text-emerald-700">+4.95% accuracy</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">vs SwinTransformer3D</span>
                      <span className="font-bold text-emerald-700">+18.47% accuracy</span>
                    </div>
                  </div>
                </div>

                {/* Dataset & Methods */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">PPMI Dataset</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">3D MRI</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Focal Loss</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Grad-CAM</span>
                </div>

                {/* Publication Status */}
                <div className="pt-2">
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Journal:</span> Artificial Intelligence in Medicine
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span> Under Review (Expected 2025)
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl p-8 border border-emerald-200">
                  <div className="space-y-6">
                    {/* Architecture Diagram */}
                    <div className="text-center">
                      <div className="text-sm font-semibold text-emerald-800 mb-4">HybridTransMedFormer Architecture</div>
                      
                      {/* Simplified Architecture Visualization */}
                      <div className="space-y-3">
                        {/* Input */}
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-200">
                          <div className="text-xs font-medium text-gray-700">3D T1-Weighted MRI</div>
                          <div className="text-xs text-gray-500">PPMI Dataset</div>
                        </div>
                        
                        {/* Dual Path */}
                        <div className="flex gap-3">
                          <div className="flex-1 bg-emerald-600 p-3 rounded-lg shadow-md">
                            <div className="text-xs font-medium text-white">CNN Path</div>
                            <div className="text-xs text-emerald-100">Local Features</div>
                            <div className="text-xs text-emerald-100">Substantia Nigra</div>
                          </div>
                          <div className="flex-1 bg-emerald-700 p-3 rounded-lg shadow-md">
                            <div className="text-xs font-medium text-white">Transformer Path</div>
                            <div className="text-xs text-emerald-100">Global Context</div>
                            <div className="text-xs text-emerald-100">Cortical-Subcortical</div>
                          </div>
                        </div>

                        {/* Dynamic Fusion */}
                        <div className="bg-emerald-800 p-3 rounded-lg shadow-md">
                          <div className="text-xs font-medium text-white">Dynamic Cross-Pathway Fusion</div>
                          <div className="text-xs text-emerald-200">Adaptive Integration</div>
                        </div>

                        {/* Classification */}
                        <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-emerald-600">
                          <div className="text-xs font-bold text-emerald-700">Multi-Class Output</div>
                          <div className="text-xs text-gray-600">Control / Prodromal / PD</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Technical Features */}
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <Zap className="w-4 h-4" />
                        <span>Dual-Path Fusion</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <TrendingUp className="w-4 h-4" />
                        <span>3D Self-Attention</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <Brain className="w-4 h-4" />
                        <span>Focal Loss (γ=2.5)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <Eye className="w-4 h-4" />
                        <span>Grad-CAM XAI</span>
                      </div>
                    </div>

                    {/* Clinical Significance */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm">
                      <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Clinical Impact
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        Detects neurodegeneration <span className="font-semibold text-emerald-700">2-3 years</span> before motor symptoms, 
                        enabling timely neuroprotective intervention
                      </div>
                    </div>
                  </div>
                </div>

                {/* Under Review Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-500 text-white px-3 py-2 rounded-full shadow-lg text-xs font-bold">
                  Under Review
                </div>
              </div>
            </div>
          </div>

          {/* Project 2: Published Paper - Hybrid CNN-Transformer (Best Paper Award) */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 lg:p-12 border border-gray-200 shadow-xl hover:shadow-2xl transition-all">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Visual */}
              <div className="relative order-2 lg:order-1">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl p-8 border border-emerald-200">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-emerald-800 mb-4">2D CNN-Transformer Hybrid</div>
                      
                      {/* Architecture Visualization */}
                      <div className="space-y-3">
                        {/* Input */}
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-200">
                          <div className="text-xs font-medium text-gray-700">2D MRI Slices</div>
                          <div className="text-xs text-gray-500">Structural Imaging</div>
                        </div>

                        {/* Hybrid Processing */}
                        <div className="flex gap-3">
                          <div className="flex-1 bg-emerald-600 p-3 rounded-lg shadow-md">
                            <div className="text-xs font-medium text-white">CNN Backbone</div>
                            <div className="text-xs text-emerald-100">Feature Extraction</div>
                          </div>
                          <div className="flex-1 bg-emerald-700 p-3 rounded-lg shadow-md">
                            <div className="text-xs font-medium text-white">Transformer</div>
                            <div className="text-xs text-emerald-100">Spatial Relations</div>
                          </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-emerald-800 p-3 rounded-lg shadow-md">
                          <div className="text-xs font-medium text-white">Classification Head</div>
                          <div className="text-xs text-emerald-200">Binary Output</div>
                        </div>

                        {/* Output */}
                        <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-emerald-600">
                          <div className="text-xs font-bold text-emerald-700">Diagnosis</div>
                          <div className="text-xs text-gray-600">PD / Healthy Control</div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200">
                      <div className="text-xs font-semibold text-gray-700 mb-3">Performance Metrics</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-lg font-bold text-emerald-700">80.51%</div>
                          <div className="text-xs text-gray-600">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-700">Fast</div>
                          <div className="text-xs text-gray-600">Inference</div>
                        </div>
                      </div>
                    </div>

                    {/* Use Case */}
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-800 mb-1">Clinical Use Case</div>
                      <div className="text-xs text-gray-700">
                        Lightweight model for rapid pre-screening and early detection
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Paper Award Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-6 order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 rounded-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-emerald-700 font-semibold">IEEE Published Paper</div>
                    <div className="text-xs text-gray-500">IARCE 2024</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-3xl font-bold text-gray-900">
                    Parkinson's Disease Recognition
                  </h3>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Best Paper Award
                  </div>
                </div>

                <p className="text-lg font-semibold text-gray-800">
                  Using Hybrid CNN-Transformer Model
                </p>
                
                <p className="text-base text-gray-700 leading-relaxed">
                  A novel hybrid architecture combining CNNs with Transformer attention mechanisms for Parkinson's disease 
                  classification using 2D structural MRI. This lightweight model provides rapid pre-screening capabilities 
                  for early PD detection.
                </p>

                {/* Key Contributions */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Hybrid Architecture</div>
                      <div className="text-sm text-gray-600">First integration of CNN and Transformer for PD from 2D MRI</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Rapid Pre-Screening</div>
                      <div className="text-sm text-gray-600">Efficient model for initial diagnostic screening with 80.51% accuracy</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Clinical Applicability</div>
                      <div className="text-sm text-gray-600">Lightweight design suitable for resource-constrained clinical settings</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">80.51%</div>
                    <div className="text-xs text-gray-600">Classification Accuracy</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">2D</div>
                    <div className="text-xs text-gray-600">MRI Analysis</div>
                  </div>
                </div>

                {/* Publication Details */}
                <div className="space-y-3 pt-2">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">Conference:</span>
                    <span className="text-gray-600"> 2024 4th International Conference on Industrial Automation, Robotics and Control Engineering (IARCE 2024)</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">DOI:</span>
                    <a 
                      href="https://doi.org/10.1109/IARCE64300.2024.00064" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 ml-1 inline-flex items-center gap-1"
                    >
                      10.1109/IARCE64300.2024.00064
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">Pages:</span>
                    <span className="text-gray-600"> pp. 307-311</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <a 
                    href="https://github.com/docAlnahiyan/Parkinson-s-Disease-Recognition-Using-Hybrid-CNN-Transformer-Model"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                  <a 
                    href="https://doi.org/10.1109/IARCE64300.2024.00064"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read Paper
                  </a>
                </div>

                {/* Award Highlight */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-800">Best Paper Award Winner</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Recognized for outstanding contribution at IARCE 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a 
            href="#publications" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-all hover:shadow-xl"
          >
            View All Publications
            <TrendingUp className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}