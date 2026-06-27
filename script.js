'use strict';

const loader = document.getElementById('loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 450));

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

const cursor = document.getElementById('cursorDot');
window.addEventListener('pointermove', e => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

// Lightweight star/particle canvas for depth.
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stars = Array.from({length: Math.min(120, Math.floor(innerWidth / 10))}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    z: Math.random()*1.6 + .25,
    r: Math.random()*1.8 + .3
  }));
}
function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(0,229,255,.75)';
  stars.forEach(s => {
    s.y += s.z * .25;
    if(s.y > canvas.height) s.y = 0;
    ctx.globalAlpha = .2 + s.z/2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
resizeCanvas();
drawStars();
addEventListener('resize', resizeCanvas);

// Scroll-driven video playback. Video currentTime is mapped to scroll progress inside each section.
const videoSections = [...document.querySelectorAll('.video-section')];
const videos = [...document.querySelectorAll('.bg-video')];

videos.forEach(video => {
  video.pause();
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('loadedmetadata', () => {
    video.currentTime = 0.01;
  });
});

let ticking = false;
function updateScrollVideos(){
  const vh = innerHeight;
  videoSections.forEach(section => {
    const video = section.querySelector('video');
    if(!video || !video.duration) return;
    const rect = section.getBoundingClientRect();
    const total = rect.height + vh;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / total));
    const targetTime = progress * Math.max(video.duration - 0.08, 0);
    if (Math.abs(video.currentTime - targetTime) > .06) video.currentTime = targetTime;
  });
  ticking = false;
}
function onScroll(){
  if(!ticking){
    requestAnimationFrame(updateScrollVideos);
    ticking = true;
  }
}
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll);

// Reveal animation and active nav.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill').forEach(skill => skill.classList.add('visible'));
    }
  });
}, {threshold:.18});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll('.nav a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, {threshold:.45});
document.querySelectorAll('main section').forEach(section => sectionObserver.observe(section));

// 3D hover tilt cards.
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateY(-5px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

// Contact form demo validation.
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', e => {
  e.preventDefault();
  if(!form.checkValidity()) return;
  status.textContent = 'Signal received. Replace this demo with Formspree, EmailJS, or backend API.';
  form.reset();
});

// Keyboard accessibility: close mobile nav.
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') nav.classList.remove('open');
});
