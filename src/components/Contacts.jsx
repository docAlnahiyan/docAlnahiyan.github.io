import React, { useState } from 'react';
import { Mail, Github, Linkedin, MapPin, Phone, Send, CheckCircle, Calendar, BookOpen, Award } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create mailto link with form data
    const mailtoLink = `mailto:al-nahiyan@outlook.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-emerald-50 via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Get in Touch
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interested in collaboration, research opportunities, or have questions? I'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Contact Information */}
          <div className="space-y-8">
            
            {/* Contact Cards */}
            <div className="space-y-4">
              
              {/* Email */}
              <a 
                href="mailto:al-nahiyan@outlook.com"
                className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-600 transition-all">
                  <Mail className="w-6 h-6 text-emerald-700 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Email</div>
                  <div className="text-lg font-bold text-gray-900">al-nahiyan@outlook.com</div>
                  <div className="text-sm text-gray-600 mt-1">Click to send email</div>
                </div>
              </a>

              {/* Phone */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Phone className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Phone / FaceTime</div>
                  <div className="text-lg font-bold text-gray-900">+86 158 2838 7920</div>
                  <div className="text-sm text-gray-600 mt-1">Available for calls & video chat</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Location</div>
                  <div className="text-lg font-bold text-gray-900">Chengdu, Sichuan</div>
                  <div className="text-sm text-gray-600 mt-1">China 610000</div>
                </div>
              </div>

            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect with Me</h3>
              <div className="space-y-3">
                
                {/* GitHub */}
                <a
                  href="https://github.com/docAlnahiyan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                >
                  <Github className="w-5 h-5" />
                  <span className="font-semibold">GitHub</span>
                </a>

                {/* ORCID */}
                <a
                  href="https://orcid.org/0009-0001-7030-8516"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">ORCID iD</div>
                    <div className="text-xs text-emerald-100">0009-0001-7030-8516</div>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                href="https://www.linkedin.com/in/al-nahiiyan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                <Linkedin className="w-5 h-5" />
                <div>
                    <div className="font-semibold">LinkedIn</div>
                    <div className="text-xs text-blue-100">al-nahiiyan</div>
                </div>
                </a>
                
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-gray-900">Current Status</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span><strong>Position:</strong> Software Requirements Research, SoftFlames Ventures LLC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span><strong>Status:</strong> Master's degree completed (2025)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span><strong>Open to:</strong> Research collaborations, PhD opportunities</span>
                </div>
              </div>
            </div>

            {/* Quick Response Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Quick Response:</strong> I typically respond to emails within 24-48 hours. 
                For urgent inquiries, please mention "Urgent" in the subject line.
              </p>
            </div>

          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Me a Message</h3>
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                <p className="text-gray-600">Your email client has opened. I'll get back to you soon!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Research Collaboration Opportunity"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Tell me about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-all hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>

                <p className="text-xs text-gray-500 text-center">
                  * This form will open your default email client with the message pre-filled
                </p>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Section - CV & Publications */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-xl border border-gray-200 p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-4">
              Looking for my CV or want to discuss research opportunities?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://raw.githubusercontent.com/docAlnahiyan/Profile-Al-Nahiyan/main/cvNahiyan.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Al-Nahiyan-Khushbu-CV.pdf"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-all"
              >
                <Award className="w-4 h-4" />
                Download CV
              </a>
              <a 
                href="#publications"
                className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-50 transition-all"
              >
                View Publications
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}