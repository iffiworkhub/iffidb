import React from 'react';
import { Mail, Phone, Globe, Linkedin, Github, Award } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-1 shadow-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-[22px] p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award size={150} />
          </div>
          
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-6">
            IA
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Iftikhar Ali</h1>
          <p className="text-xl text-primary font-medium mb-6">Full Stack Developer</p>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            This project, <span className="font-bold text-gray-900 dark:text-white">IffiDB</span>, is a robust Database Management System designed for a university assignment. 
            It demonstrates advanced frontend capability using React, TailwindCSS, and simulated Backend logic.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a href="mailto:iffibaloch334@gmail.com" className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white rounded-xl transition-all duration-300">
              <Mail size={20} />
              <span>iffibaloch334@gmail.com</span>
            </a>
            <a href="https://wa.me/923181998588" className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-green-500 hover:text-white rounded-xl transition-all duration-300">
              <Phone size={20} />
              <span>03181998588</span>
            </a>
            <a href="https://iffi.dev" className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-purple-500 hover:text-white rounded-xl transition-all duration-300">
              <Globe size={20} />
              <span>iffi.dev</span>
            </a>
          </div>

          <div className="flex justify-center gap-6 text-gray-400">
            <a href="#" className="hover:text-primary transition-colors"><Linkedin size={24} /></a>
            <a href="#" className="hover:text-primary transition-colors"><Github size={24} /></a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Project Specs</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> React 18 & TypeScript
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span> Tailwind CSS Styling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Mock REST API Services
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> JWT Auth Simulation
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Course Details</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium">University Assignment Project</p>
            <p>Database Management Systems (DBMS)</p>
            <p>Supervisor: Sir [Name]</p>
            <p className="mt-4 text-xs text-gray-500">All rights reserved © 2024 Iftikhar Ali.</p>
          </div>
        </div>
      </div>
    </div>
  );
};