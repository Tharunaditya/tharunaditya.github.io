/**
 * Blog Enhanced Features
 * Reading Progress, TOC, Back to Top, Copy Code, Search
 */

class BlogEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.initReadingProgress();
        this.initTableOfContents();
        this.initBackToTop();
        this.initCopyCode();
        this.initSearch();
        this.initUtterancesTheme();
        this.initTagCloud();
        this.initViewCount();
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
     * Auto-generate Table of Contents from headings
     */
    initTableOfContents() {
        const contentWrapper = document.querySelector('.content-wrapper');
        const tocContainer = document.getElementById('toc-container');
        
        if (!contentWrapper || !tocContainer) return;

        const headings = contentWrapper.querySelectorAll('h2, h3');
        if (headings.length < 3) return; // Only show TOC if there are 3+ headings

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
            
            const level = heading.tagName === 'H2' ? '' : 'style="margin-left: 1rem;"';
            tocContent += `<li ${level}><a href="#${id}">${heading.textContent}</a></li>`;
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
                }
            });
        });

        // Highlight active section in TOC
        this.highlightActiveTOC(headings);
    }

    highlightActiveTOC(headings) {
        const tocLinks = document.querySelectorAll('.toc-list a');
        if (tocLinks.length === 0) return;

        window.addEventListener('scroll', () => {
            let current = '';
            
            headings.forEach(heading => {
                const sectionTop = heading.offsetTop;
                if (window.pageYOffset >= sectionTop - 100) {
                    current = heading.getAttribute('id');
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    /**
     * Back to Top Button
     */
    initBackToTop() {
        // Create button if it doesn't exist
        let backToTopBtn = document.querySelector('.back-to-top');
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(backToTopBtn);
        }

        // Show/hide on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

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
     * Update Utterances theme based on site theme
     */
    initUtterancesTheme() {
        const observer = new MutationObserver(() => {
            const isDark = document.body.classList.contains('dark-mode');
            const utterancesFrame = document.querySelector('.utterances-frame');
            
            if (utterancesFrame) {
                const theme = isDark ? 'github-dark' : 'github-light';
                const message = {
                    type: 'set-theme',
                    theme: theme
                };
                utterancesFrame.contentWindow.postMessage(message, 'https://utteranc.es');
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BlogEnhancements());
} else {
    new BlogEnhancements();
}
