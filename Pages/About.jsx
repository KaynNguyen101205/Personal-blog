import React from "react";
import { Github, Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export default function About() {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode

  const socialLinks = [
  { icon: Github, url: "https://github.com/KaynNguyen101205", label: "GitHub", username: "@KaynNguyen101205" },
  { icon: Facebook, url: "https://www.facebook.com/itisnamkhanh/", label: "Facebook", username: "Nam Khánh" },
  { icon: Instagram, url: "https://www.instagram.com/capheout/", label: "Instagram", username: "@capheout" },
  { icon: Linkedin, url: "https://www.linkedin.com/in/nam-khanh-kayane-nguyen-789902271/", label: "LinkedIn", username: "Nam Khanh (Kayane) Nguyen" },
  { icon: Mail, url: "mailto:nguyenkayn5@gmail.com", label: "Email", username: "nguyenkayn5@gmail.com" },
  {
    icon: () =>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>,

    url: "https://x.com/Iamnamkhanh",
    label: "X (Twitter)",
    username: "@Iamnamkhanh"
  }];


  const skillCategories = [
  {
    title: "Programming Languages",
    skills: ["Go", "C", "C++", "Python", "Bash", "F#", "TypeScript", "R", "SQL", "Java", "JavaScript", "HTML", "CSS"]
  },
  {
    title: "Containerization",
    skills: ["Kubernetes", "Docker", "Helm"]
  },
  {
    title: "CI/CD",
    skills: ["GitHub Actions", "GitLab CI CD", "Jenkins", "Azure DevOps"]
  },
  {
    title: "Infrastructure as Code",
    skills: ["Terraform", "Ansible"]
  },
  {
    title: "Cloud Computing",
    skills: ["AWS", "Google Cloud Platform (GCP)", "Azure", "Alibaba Cloud"]
  },
  {
    title: "Developer Tools",
    skills: ["Git", "VMware", "Postman", "SonarQube", "macOS", "Linux", "IntelliJ", "JetBrains"]
  },
  {
    title: "Methodologies",
    skills: ["Agile", "Scrum", "DevOps", "Deployment", "Waterfall"]
  }];


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* About Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-left" style={{ color: textColor }}>
        About
      </h1>

      {/* Profile Section */}
      <div className="neumorphic-shadow rounded-3xl p-8 md:p-12">
        <div className="flex flex-col space-y-6">
          {/* Lotus Image */}
          <div className="w-full flex justify-center mb-6">
            <img 
              src="/lotus.jpg" 
              alt="Lotus painting" 
              className="w-full h-auto object-contain rounded-lg"
              style={{ maxHeight: '500px' }}
            />
          </div>

          {/* Bio */}
          <div className="w-full text-left">
            <div className="space-y-4" style={{ color: isDarkMode ? '#D2C1B6' : '#000000' }}>
              <p className="leading-relaxed">
                Hi, I'm Nam Khanh Nguyen, but most people call me Kayane or Kayn.
                I'm a Computer Science undergraduate at the University of Illinois Chicago. My days are split between designing scalable cloud architectures and writing code that bridges systems, people, and ideas.
              </p>
              <p className="leading-relaxed">
                At work, I build and automate infrastructure using Kubernetes, Terraform, and various cloud computing platforms, including AWS, GCP, and Azure, to craft CI/CD pipelines that actually make life easier.
              </p>
              <p className="leading-relaxed">
                At school, I explore how software design, data systems, and embedded computing connect from Arduino circuits to geospatial web apps like Bluetrace for marine microplastic monitoring. I love solving problems that sit at the intersection of disciplines, where hardware meets cloud and code meets creativity.
              </p>
              <p className="leading-relaxed">
                Outside of code, you'll often find me behind a Fujifilm camera, capturing light and stories, or sketching project ideas in GoodNotes over a cup of coffee.
              </p>
              <p className="leading-relaxed">
                This blog is where I document what I'm learning in DevOps, SRE, and life. If you're into automation, minimalism, and tech, you'll feel right at home here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="neumorphic-shadow rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: textColor }}>
          Skills
        </h2>
        
        <div className="space-y-6">
          {skillCategories.map((category, index) => <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                • {category.title}
              </h3>
              <div className="flex flex-wrap gap-2 ml-4">
                {category.skills.map((skill, skillIndex) => <div key={skillIndex} className="neumorphic-inset rounded-xl px-3 py-1.5">
                    <span style={{ color: textColor }} className="text-sm font-medium">{skill}</span>
                  </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect Section */}
      <div className="neumorphic-shadow rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: textColor }}>
          Let's Connect
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((social, index) =>
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="neumorphic-shadow rounded-2xl p-4 neumorphic-hover flex items-center gap-4">

              <div className="neumorphic-inset rounded-xl p-3">
                {typeof social.icon === 'function' ?
              <div style={{ color: subtleTextColor }}>
                    <social.icon />
                  </div> :

              <social.icon className="w-6 h-6" style={{ color: subtleTextColor }} />
              }
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: textColor }}>
                  {social.label}
                </div>
                <div className="text-sm" style={{ color: subtleTextColor }}>
                  {social.username}
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>);

}