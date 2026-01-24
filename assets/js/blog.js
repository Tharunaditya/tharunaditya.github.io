/**
 * Blog Enhanced Features
 * Collapsible Sidebars, Scroll Spy, FAB Toolbar, Reader Mode, Keyboard Shortcuts
 */

class BlogEnhancements {
    constructor() {
        this.tocSidebar = null;
        this.seriesSidebar = null;
        this.backdrop = null;
        this.fabToolbar = null;
        this.shareMenu = null;
        this.intersectionObserver = null;
        
        this.init();
    }

    init() {
        this.initReadingProgress();
        this.initCollapsibleSidebars();
        this.initTableOfContents();
        this.initScrollSpy();
        this.initFloatingActionBar();
        this.initShareMenu();
        this.initReaderMode();
        this.initKeyboardShortcuts();
        this.initBackToTop();
        this.initCopyCode();
        this.initSearch();
        this.initGiscusTheme();
        this.initTagCloud();
        this.initViewCount();
        this.initNotificationPopup();
        this.initLocalStorage();
        this.initProgressBarAnimation();
    }

    /**
     * Reading Progress Bar
     */
    initReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    /**
     * Collapsible Sidebars with Smooth Animations
     */
    initCollapsibleSidebars() {
        this.tocSidebar = document.getElementById('tocSidebar');
        this.seriesSidebar = document.getElementById('seriesSidebar');
        this.backdrop = document.getElementById('sidebarBackdrop');
        
        const tocToggle = document.querySelector('.toc-toggle');
        const seriesToggle = document.querySelector('.series-toggle');
        
        // TOC Toggle
        if (tocToggle && this.tocSidebar) {
            tocToggle.addEventListener('click', () => this.toggleSidebar('toc'));
            
            const tocClose = this.tocSidebar.querySelector('.sidebar-close');
            if (tocClose) {
                tocClose.addEventListener('click', () => this.closeSidebar('toc'));
            }
        }
        
        // Series Toggle
        if (seriesToggle && this.seriesSidebar) {
            seriesToggle.addEventListener('click', () => this.toggleSidebar('series'));
            
            const seriesClose = this.seriesSidebar.querySelector('.sidebar-close');
            if (seriesClose) {
                seriesClose.addEventListener('click', () => this.closeSidebar('series'));
            }
        }
        
        // Backdrop click to close
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => {
                this.closeSidebar('toc');
                this.closeSidebar('series');
            });
        }

        // Load saved state from localStorage
        this.loadSidebarState();
    }

    toggleSidebar(type) {
        const sidebar = type === 'toc' ? this.tocSidebar : this.seriesSidebar;
        const toggle = document.querySelector(`.${type}-toggle`);
        
        if (!sidebar) return;
        
        const isExpanded = sidebar.classList.contains('expanded');
        
        if (isExpanded) {
            this.closeSidebar(type);
        } else {
            this.openSidebar(type);
        }
    }

    openSidebar(type) {
        const sidebar = type === 'toc' ? this.tocSidebar : this.seriesSidebar;
        const toggle = document.querySelector(`.${type}-toggle`);
        
        if (!sidebar) return;
        
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('expanded');
        sidebar.setAttribute('aria-hidden', 'false');
        
        if (toggle) {
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
        }
        
        if (this.backdrop) {
            this.backdrop.classList.add('active');
        }
        
        // Save state
        this.saveSidebarState(type, true);
    }

    closeSidebar(type) {
        const sidebar = type === 'toc' ? this.tocSidebar : this.seriesSidebar;
        const toggle = document.querySelector(`.${type}-toggle`);
        
        if (!sidebar) return;
        
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        sidebar.setAttribute('aria-hidden', 'true');
        
        if (toggle) {
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
        
        // Close backdrop if both sidebars are closed
        const bothClosed = (!this.tocSidebar || this.tocSidebar.classList.contains('collapsed')) &&
                          (!this.seriesSidebar || this.seriesSidebar.classList.contains('collapsed'));
        
        if (bothClosed && this.backdrop) {
            this.backdrop.classList.remove('active');
        }
        
        // Save state
        this.saveSidebarState(type, false);
    }

    /**
     * Auto-generate Table of Contents with Scroll Spy
     */
    initTableOfContents() {
        const contentWrapper = document.querySelector('.content-wrapper');
        const tocContainer = document.getElementById('toc-container');
        
        if (!contentWrapper || !tocContainer) return;

        const headings = contentWrapper.querySelectorAll('h2, h3');
        if (headings.length < 2) return; // Show TOC if there are 2+ headings

        const tocHTML = `
            <div class="toc-wrapper">
                <h3 class="toc-title"><i class="fas fa-list"></i> Table of Contents</h3>
                <ul class="toc-list" id="toc-list"></ul>
            </div>
        `;
        tocContainer.innerHTML = tocHTML;

        const tocList = document.getElementById('toc-list');
        let tocContent = '';

        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const isH3 = heading.tagName === 'H3';
            const listClass = isH3 ? 'class="nested"' : '';
            tocContent += `<li ${listClass}><a href="#${id}">${heading.textContent}</a></li>`;
        });

        tocList.innerHTML = tocContent;

        // Smooth scroll for TOC links
        tocList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Close sidebar on mobile after click
                    if (window.innerWidth <= 992) {
                        this.closeSidebar('toc');
                    }
                }
            });
        });
    }

    /**
     * Scroll Spy with Intersection Observer
     */
    initScrollSpy() {
        const headings = document.querySelectorAll('.content-wrapper h2, .content-wrapper h3');
        const tocLinks = document.querySelectorAll('.toc-list a');
        
        if (headings.length === 0 || tocLinks.length === 0) return;

        const observerOptions = {
            rootMargin: '-100px 0px -66%',
            threshold: 0
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current link
                    const activeLink = document.querySelector(`.toc-list a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                        
                        // Auto-scroll TOC to keep active item visible
                        const tocSidebar = document.getElementById('tocSidebar');
                        if (tocSidebar && tocSidebar.classList.contains('expanded')) {
                            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                }
            });
        }, observerOptions);

        headings.forEach(heading => {
            this.intersectionObserver.observe(heading);
        });
    }

    /**
     * Floating Action Bar
     */
    initFloatingActionBar() {
        this.fabToolbar = document.getElementById('fabToolbar');
        if (!this.fabToolbar) return;

        // Show/hide FAB on scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show FAB after scrolling down 300px
            if (scrollTop > 300) {
                this.fabToolbar.classList.add('visible');
            } else {
                this.fabToolbar.classList.remove('visible');
            }
            
            lastScrollTop = scrollTop;
        });

        // Back to Top
        const fabTop = document.getElementById('fabBackToTop');
        if (fabTop) {
            fabTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Share button
        const fabShare = document.querySelector('.fab-share');
        if (fabShare) {
            fabShare.addEventListener('click', () => this.openShareMenu());
        }

        // Reader mode
        const readerBtn = document.getElementById('readerModeBtn');
        if (readerBtn) {
            readerBtn.addEventListener('click', () => this.toggleReaderMode());
        }
    }

    /**
     * Share Menu
     */
    initShareMenu() {
        this.shareMenu = document.getElementById('shareMenu');
        if (!this.shareMenu) return;

        const closeBtn = this.shareMenu.querySelector('.share-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeShareMenu());
        }

        // Copy link button
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const url = copyBtn.getAttribute('data-url');
                navigator.clipboard.writeText(url).then(() => {
                    copyBtn.classList.add('copied');
                    const span = copyBtn.querySelector('span');
                    const originalText = span.textContent;
                    span.textContent = 'Copied!';
                    
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        span.textContent = originalText;
                    }, 2000);
                });
            });
        }

        // Close on backdrop click
        this.shareMenu.addEventListener('click', (e) => {
            if (e.target === this.shareMenu) {
                this.closeShareMenu();
            }
        });
    }

    openShareMenu() {
        if (this.shareMenu) {
            this.shareMenu.classList.add('active');
            if (this.backdrop) {
                this.backdrop.classList.add('active');
            }
        }
    }

    closeShareMenu() {
        if (this.shareMenu) {
            this.shareMenu.classList.remove('active');
            
            // Check if sidebars are open before closing backdrop
            const anySidebarOpen = (this.tocSidebar && this.tocSidebar.classList.contains('expanded')) ||
                                  (this.seriesSidebar && this.seriesSidebar.classList.contains('expanded'));
            
            if (!anySidebarOpen && this.backdrop) {
                this.backdrop.classList.remove('active');
            }
        }
    }

    /**
     * Reader Mode
     */
    initReaderMode() {
        // Check saved preference
        const isReaderMode = localStorage.getItem('readerMode') === 'true';
        if (isReaderMode) {
            document.body.classList.add('reader-mode');
            const readerBtn = document.getElementById('readerModeBtn');
            if (readerBtn) readerBtn.classList.add('active');
        }
    }

    toggleReaderMode() {
        document.body.classList.toggle('reader-mode');
        const readerBtn = document.getElementById('readerModeBtn');
        const isActive = document.body.classList.contains('reader-mode');
        
        if (readerBtn) {
            readerBtn.classList.toggle('active', isActive);
        }
        
        // Save preference
        localStorage.setItem('readerMode', isActive);
    }

    /**
     * Keyboard Shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch(e.key.toLowerCase()) {
                case 't':
                    e.preventDefault();
                    this.toggleSidebar('toc');
                    break;
                case 's':
                    e.preventDefault();
                    if (this.seriesSidebar) {
                        this.toggleSidebar('series');
                    }
                    break;
                case 'r':
                    e.preventDefault();
                    this.toggleReaderMode();
                    break;
                case 'escape':
                    this.closeSidebar('toc');
                    this.closeSidebar('series');
                    this.closeShareMenu();
                    break;
            }
        });
    }

    /**
     * localStorage Persistence
     */
    saveSidebarState(type, isOpen) {
        localStorage.setItem(`sidebar-${type}`, isOpen);
    }

    loadSidebarState() {
        // Auto-open sidebars on desktop if they were previously open
        if (window.innerWidth > 992) {
            const tocState = localStorage.getItem('sidebar-toc');
            const seriesState = localStorage.getItem('sidebar-series');
            
            // Don't auto-open by default, wait for user interaction
            // This creates a cleaner initial experience
        }
    }

    /**
     * Animate Progress Bar Fill
     */
    initProgressBarAnimation() {
        const progressBar = document.querySelector('.progress-bar-fill');
        if (!progressBar) return;

        // Get data-progress attribute
        const progress = progressBar.getAttribute('data-progress');
        if (progress) {
            setTimeout(() => {
                progressBar.style.width = progress + '%';
            }, 500);
        }
    }

    /**
     * Back to Top Button (Legacy - kept for compatibility)
     */
    initBackToTop() {
        // Create button if it doesn't exist
        let backToTopBtn = document.querySelector('.back-to-top');
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopBtn.setAttribute('aria-label', 'Back to top');

    /**
     * Copy Code Button for code blocks
     */
    initCopyCode() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            
            // Wrap in container
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            wrapper.appendChild(copyBtn);

            copyBtn.addEventListener('click', async () => {
                const code = codeBlock.textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                    copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                }
            });
        });
    }

    /**
     * Blog Search Functionality
     */
    initSearch() {
        const searchInput = document.getElementById('blog-search');
        const searchResults = document.getElementById('search-results');
        const blogGrid = document.querySelector('.blog-grid');
        
        if (!searchInput) return;

        let posts = [];

        // Fetch all posts data
        fetch('/search.json')
            .then(response => response.json())
            .then(data => {
                posts = data;
            })
            .catch(() => {
                console.log('Search index not available');
            });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                if (blogGrid) blogGrid.style.display = 'grid';
                return;
            }

            const filtered = posts.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                post.categories.some(cat => cat.toLowerCase().includes(query))
            );

            this.displaySearchResults(filtered, query);
        });
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        const blogGrid = document.querySelector('.blog-grid');
        
        if (blogGrid) blogGrid.style.display = 'none';
        searchResults.style.display = 'block';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found for "${query}"</h3>
                    <p>Try different keywords or browse all posts</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(post => `
            <article class="blog-card glass-card">
                ${post.image ? `
                    <div class="blog-card-image">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                ` : ''}
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="far fa-calendar"></i>
                            ${post.date}
                        </span>
                    </div>
                    <h2 class="blog-card-title">
                        <a href="${post.url}">${post.title}</a>
                    </h2>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-tags">
                        ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${post.url}" class="blog-read-more">
                        Continue Reading <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');

        searchResults.innerHTML = `
            <h3 class="search-results-title">Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</h3>
            <div class="blog-grid">${resultsHTML}</div>
        `;
    }

    /**
     * Update Giscus theme based on site theme
     */
    initGiscusTheme() {
        const observer = new MutationObserver(() => {
            const isDark = document.body.classList.contains('dark-mode');
            const giscusFrame = document.querySelector('iframe.giscus-frame');
            
            if (giscusFrame) {
                const theme = isDark ? 'dark' : 'light';
                const message = {
                    giscus: {
                        setConfig: {
                            theme: theme
                        }
                    }
                };
                giscusFrame.contentWindow.postMessage(message, 'https://giscus.app');
            }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    /**
     * Tag Cloud Filtering
     */
    initTagCloud() {
        const tagItems = document.querySelectorAll('.tag-cloud-item');
        const blogCards = document.querySelectorAll('.blog-card');
        
        if (tagItems.length === 0) return;

        tagItems.forEach(tagItem => {
            tagItem.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedTag = tagItem.dataset.tag;
                
                // Toggle active state
                const isActive = tagItem.classList.contains('active');
                
                if (isActive) {
                    // Deactivate and show all posts
                    tagItem.classList.remove('active');
                    blogCards.forEach(card => {
                        card.style.display = '';
                    });
                } else {
                    // Deactivate all other tags
                    tagItems.forEach(item => item.classList.remove('active'));
                    tagItem.classList.add('active');
                    
                    // Filter posts
                    blogCards.forEach(card => {
                        const cardTags = card.querySelectorAll('.blog-tags .tag');
                        let hasTag = false;
                        
                        cardTags.forEach(tag => {
                            const tagSlug = tag.textContent.toLowerCase().replace(/\s+/g, '-');
                            if (tagSlug === selectedTag) {
                                hasTag = true;
                            }
                        });
                        
                        card.style.display = hasTag ? '' : 'none';
                    });
                    
                    // Scroll to results
                    document.querySelector('.blog-grid').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * View Count Display (using localStorage for simplicity)
     * For production, consider using a backend service or analytics API
     */
    initViewCount() {
        const viewCountElements = document.querySelectorAll('.post-view-count');
        
        viewCountElements.forEach(element => {
            const postUrl = element.dataset.url || window.location.pathname;
            const storageKey = `view_count_${postUrl}`;
            
            // Get or initialize view count
            let viewCount = parseInt(localStorage.getItem(storageKey) || '0');
            
            // Increment on first visit (check session)
            const sessionKey = `viewed_${postUrl}`;
            if (!sessionStorage.getItem(sessionKey)) {
                viewCount++;
                localStorage.setItem(storageKey, viewCount);
                sessionStorage.setItem(sessionKey, 'true');
            }
            
            // Display count
            element.innerHTML = `<i class="fas fa-eye"></i> ${viewCount} ${viewCount === 1 ? 'view' : 'views'}`;
        });
    }

    /**
     * Notification Popup - Smart timing for push notification opt-in
     * Shows after user reads 30% of blog post
     */
    initNotificationPopup() {
        // Only show on blog posts
        const isPostPage = document.body.classList.contains('post-page') || 
                          document.querySelector('.post-content');
        if (!isPostPage) return;

        const popup = document.getElementById('notification-popup');
        if (!popup) return;

        const closeBtn = popup.querySelector('.notification-close');
        const laterBtn = popup.querySelector('.notification-btn.secondary');
        const enableBtn = popup.querySelector('.notification-btn.primary');

        // Check if user already interacted with the popup
        const popupDismissed = localStorage.getItem('notificationPopupDismissed');
        const popupEnabled = localStorage.getItem('notificationPopupEnabled');

        if (popupDismissed || popupEnabled) {
            return; // Don't show popup again
        }

        // Show popup after reading 30% of the post
        let shown = false;
        const showPopupOnScroll = () => {
            if (shown) return;

            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            if (scrollPercent >= 30) {
                setTimeout(() => {
                    popup.classList.add('show');
                    shown = true;
                }, 500);
                window.removeEventListener('scroll', showPopupOnScroll);
            }
        };

        window.addEventListener('scroll', showPopupOnScroll);

        // Close button handler
        const hidePopup = () => {
            popup.classList.remove('show');
            localStorage.setItem('notificationPopupDismissed', 'true');
        };

        closeBtn.addEventListener('click', hidePopup);
        laterBtn.addEventListener('click', hidePopup);

        // Enable notifications button
        enableBtn.addEventListener('click', async () => {
            try {
                // Request notification permission using OneSignal
                if (window.OneSignal) {
                    await window.OneSignal.Slidedown.promptPush();
                    localStorage.setItem('notificationPopupEnabled', 'true');
                    popup.classList.remove('show');
                }
            } catch (error) {
                console.error('Error enabling notifications:', error);
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BlogEnhancements());
} else {
    new BlogEnhancements();
}
