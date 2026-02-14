// Application State
const state = {
    currentUser: null,
    jobs: [],
    savedJobs: new Set(JSON.parse(localStorage.getItem('savedJobs')) || []),
    isLoading: false
};

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function truncateText(text, length) {
    if (!text || text.length <= length) return text || '';
    return text.substring(0, length).trim() + '...';
}

function formatSalary(salary) {
    if (!salary) return 'Salary not specified';
    return `PKR ${salary.toLocaleString()}/month`;
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('floatingNotification');
    if (!notification) return;

    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    notification.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${message}</span>`;
    notification.className = `floating-notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    showNotification(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info');
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (navMenu) {
        navMenu.classList.toggle('active');

        if (mobileMenu) {
            if (navMenu.classList.contains('active')) {
                mobileMenu.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenu.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    }
}

function navigateToPage(page) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(page + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupCommonEventListeners() {
    // Mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', toggleMobileMenu);
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            navigateToPage(targetPage);
        });
    });

    // Footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            navigateToPage(targetPage);
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Show/hide back to top button
    window.addEventListener('scroll', function () {
        if (backToTop) {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        }
    });

    // Close modals when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function () {
    setupCommonEventListeners();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
});