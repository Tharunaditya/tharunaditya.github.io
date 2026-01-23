// ============================================
// PORTFOLIO ENHANCED VERSION 2.0
// Modern Vanilla JavaScript Implementation
// ============================================

'use strict';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    github: {
        username: 'Tharunaditya',
        apiUrl: 'https://api.github.com/users/Tharunaditya'
    },
    typing: {
        texts: [
            'Security Researcher',
            'Cybersecurity Enthusiast',
            'AI Specialist',
            'UI/UX Designer',
            'Penetration Tester',
            'Full Stack Developer'
        ],
        typingSpeed: 100,
        deletingSpeed: 50,
        delayBetweenTexts: 2000
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Smooth scroll to element
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// ============================================
// LOADING SCREEN
// ============================================
class LoadingScreen {
    constructor() {
        this.loadingEl = document.getElementById('loading-screen');
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 1500);
        });
    }

    hide() {
        this.loadingEl.classList.add('hidden');
    }
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
class ScrollProgress {
    constructor() {
        this.progressBar = document.getElementById('scroll-progress');
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.update();
        }, 10));
    }

    update() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        this.progressBar.style.width = `${scrolled}%`;
    }
}

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.menuToggle = document.getElementById('menu-toggle');
        this.navLinksContainer = document.querySelector('.nav-links');
    }

    init() {
        this.handleScroll();
        this.handleActiveLink();
        this.handleMobileMenu();
        this.smoothScroll();
    }

    handleScroll() {
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 10));
    }

    handleActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100));
    }

    handleMobileMenu() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.navLinksContainer.classList.toggle('active');
            });

            // Close menu when clicking on a link
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.navLinksContainer.classList.remove('active');
                });
            });
        }
    }

    smoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        Utils.smoothScrollTo(target);
                    }
                }
            });
        });
    }
}

// ============================================
// THEME TOGGLE
// ============================================
class ThemeToggle {
    constructor() {
        this.toggle = document.getElementById('theme-toggle');
        this.body = document.body;
        this.icon = this.toggle.querySelector('i');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
    }

    init() {
        this.setTheme(this.currentTheme);
        
        this.toggle.addEventListener('click', () => {
            this.switchTheme();
        });
    }

    setTheme(theme) {
        if (theme === 'light') {
            this.body.classList.add('light-mode');
            this.icon.classList.remove('fa-moon');
            this.icon.classList.add('fa-sun');
        } else {
            this.body.classList.remove('light-mode');
            this.icon.classList.remove('fa-sun');
            this.icon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;

        // Broadcast theme change so other modules (particles, etc.) can react.
        this.body.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
    }

    switchTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// ============================================
// TYPING ANIMATION
// ============================================
class TypingAnimation {
    constructor() {
        this.element = document.querySelector('.typing-text');
        this.texts = CONFIG.typing.texts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
    }

    init() {
        if (this.element) {
            this.type();
        }
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.isDeleting ? CONFIG.typing.deletingSpeed : CONFIG.typing.typingSpeed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = CONFIG.typing.delayBetweenTexts;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// STATS COUNTER ANIMATION
// ============================================
class StatsCounter {
    constructor() {
        this.stats = document.querySelectorAll('.stat-number');
        this.hasAnimated = false;
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateStats();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.stats-row');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateStats() {
        this.stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }
}

// ============================================
// GITHUB API INTEGRATION
// ============================================
class GitHubStats {
    constructor() {
        this.reposElement = document.getElementById('github-repos');
    }

    async init() {
        try {
            const data = await this.fetchGitHubData();
            if (data && this.reposElement) {
                this.reposElement.setAttribute('data-target', data.public_repos);
                // Counter will be animated by StatsCounter class
            }
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            if (this.reposElement) {
                this.reposElement.textContent = '10+';
            }
        }
    }

    async fetchGitHubData() {
        const response = await fetch(CONFIG.github.apiUrl);
        if (!response.ok) throw new Error('GitHub API request failed');
        return await response.json();
    }
}

// ============================================
// SKILL PROGRESS BARS
// ============================================
class SkillBars {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.hasAnimated = false;
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateBars();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.3 });

        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    }

    animateBars() {
        this.skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            setTimeout(() => {
                bar.style.width = `${progress}%`;
            }, 100);
        });
    }
}

// ============================================
// PROJECT FILTERS
// ============================================
class ProjectFilters {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterProjects(filter);
                this.setActiveButton(btn);
            });
        });
    }

    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    setActiveButton(activeBtn) {
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
}

// ============================================
// PARTICLES BACKGROUND
// ============================================
class ParticlesBackground {
    init() {
        this.render();

        // Re-render particles when theme changes to keep visibility in both modes.
        document.body.addEventListener('theme-changed', () => {
            this.render();
        });
    }

    destroy() {
        if (window.pJSDom && window.pJSDom.length) {
            window.pJSDom.forEach(instance => instance.pJS.fn.vendors.destroypJS());
            window.pJSDom = [];
        }
    }

    getAccentColors() {
        const styles = getComputedStyle(document.documentElement);
        const primary = styles.getPropertyValue('--accent-primary').trim() || '#00ff41';
        const active = styles.getPropertyValue('--accent-active').trim() || primary;
        const particleColor = styles.getPropertyValue('--particle-color').trim() || active;
        const lineColor = styles.getPropertyValue('--particle-line-color').trim() || active;
        return { primary, active, particleColor, lineColor };
    }

    render() {
        if (typeof particlesJS === 'undefined') return;

        this.destroy();
        const { active, particleColor, lineColor } = this.getAccentColors();

        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: particleColor || active
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.50,
                    random: true
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: lineColor || active,
                    opacity: 0.50,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// FORM HANDLING
// ============================================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                // Formspree will handle the submission
                // You can add custom validation or success message here
                console.log('Form submitted');
            });
        }
    }
}

// ============================================
// INITIALIZE ALL MODULES
// ============================================
class App {
    constructor() {
        this.modules = [
            new LoadingScreen(),
            new ScrollProgress(),
            new Navigation(),
            new ThemeToggle(),
            new TypingAnimation(),
            new StatsCounter(),
            new GitHubStats(),
            new SkillBars(),
            new ProjectFilters(),
            new ParticlesBackground(),
            new BackToTop(),
            new ContactForm()
        ];
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeModules();
            });
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        this.modules.forEach(module => {
            if (typeof module.init === 'function') {
                module.init();
            }
        });

        console.log('🚀 Portfolio v2.0 initialized successfully!');
    }
}

// ============================================
// START APPLICATION
// ============================================
const app = new App();
app.init();
