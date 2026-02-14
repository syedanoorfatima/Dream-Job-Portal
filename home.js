// Home page state
const homeState = {
    filteredJobs: [],
    currentPage: 1,
    jobsPerPage: 8,
    hasMoreJobs: true,
    filters: {
        search: '',
        location: '',
        category: '',
        experience: '',
        salary: ''
    }
};

// Initialize home page
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('homeSection')) {
        loadMockJobs();
        setupHomeEventListeners();
        filterJobs();
    }
});

function loadMockJobs() {
    // Mock job data
    state.jobs = [
        {
            id: 1,
            title: 'Frontend Developer',
            company: 'Tech Solutions Inc.',
            location: 'Karachi, Pakistan',
            type: 'Full-time',
            experience: 'Mid Level',
            salary: 80000,
            description: 'We are looking for a skilled Frontend Developer to join our team.',
            skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
            isFeatured: true,
            isRemote: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            applicationsCount: 12
        },
        // Add more mock jobs here...
    ];

    homeState.filteredJobs = [...state.jobs];
}

function setupHomeEventListeners() {
    // Search functionality
    const jobSearch = document.getElementById('jobSearch');
    const locationSearch = document.getElementById('locationSearch');
    const searchBtn = document.getElementById('searchBtn');

    if (jobSearch) {
        jobSearch.addEventListener('input', debounce(filterJobs, 300));
    }
    if (locationSearch) {
        locationSearch.addEventListener('input', debounce(filterJobs, 300));
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', filterJobs);
    }

    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    const cityFilter = document.getElementById('cityFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const salaryFilter = document.getElementById('salaryFilter');
    const clearFilters = document.getElementById('clearFilters');

    if (categoryFilter) categoryFilter.addEventListener('change', filterJobs);
    if (cityFilter) cityFilter.addEventListener('change', filterJobs);
    if (experienceFilter) experienceFilter.addEventListener('change', filterJobs);
    if (salaryFilter) salaryFilter.addEventListener('change', filterJobs);
    if (clearFilters) clearFilters.addEventListener('click', clearFiltersHandler);

    // Load more jobs
    const loadMoreJobs = document.getElementById('loadMoreJobs');
    if (loadMoreJobs) {
        loadMoreJobs.addEventListener('click', loadMoreJobsHandler);
    }

    // Popular tags
    const popularTags = document.querySelectorAll('.popular-tag');
    popularTags.forEach(tag => {
        tag.addEventListener('click', function () {
            const tagText = this.textContent.trim();
            if (jobSearch) {
                jobSearch.value = tagText;
                filterJobs();
            }
        });
    });

    // Job card interactions
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-apply') || e.target.closest('.btn-apply')) {
            const button = e.target.classList.contains('btn-apply') ? e.target : e.target.closest('.btn-apply');
            const jobId = parseInt(button.getAttribute('data-id'));
            applyForJob(jobId);
        }

        if (e.target.classList.contains('btn-save') || e.target.closest('.btn-save')) {
            const button = e.target.classList.contains('btn-save') ? e.target : e.target.closest('.btn-save');
            const jobId = parseInt(button.getAttribute('data-id'));
            toggleSaveJob(jobId, button);
        }
    });
}

function filterJobs() {
    // Get filter values
    homeState.filters.search = document.getElementById('jobSearch') ? document.getElementById('jobSearch').value.toLowerCase() : '';
    homeState.filters.location = document.getElementById('locationSearch') ? document.getElementById('locationSearch').value.toLowerCase() : '';
    homeState.filters.category = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : '';
    homeState.filters.experience = document.getElementById('experienceFilter') ? document.getElementById('experienceFilter').value : '';
    homeState.filters.salary = document.getElementById('salaryFilter') ? document.getElementById('salaryFilter').value : '';

    // Apply filters
    homeState.filteredJobs = state.jobs.filter(job => {
        return applyJobFilters(job, homeState.filters);
    });

    // Reset pagination
    homeState.currentPage = 1;
    homeState.hasMoreJobs = homeState.filteredJobs.length > homeState.jobsPerPage;

    // Render jobs
    renderJobs();
}

function applyJobFilters(job, filters) {
    // Search filter
    if (filters.search &&
        !job.title.toLowerCase().includes(filters.search) &&
        !job.company.toLowerCase().includes(filters.search) &&
        !job.description.toLowerCase().includes(filters.search)) {
        return false;
    }

    // Location filter
    if (filters.location &&
        !job.location.toLowerCase().includes(filters.location)) {
        return false;
    }

    // Add other filter logic here...

    return true;
}

function renderJobs() {
    const jobListingsContainer = document.getElementById('jobListingsContainer');
    const jobCount = document.getElementById('jobCount');

    if (!jobListingsContainer) return;

    // Calculate jobs to show
    const startIndex = 0;
    const endIndex = homeState.currentPage * homeState.jobsPerPage;
    const jobsToShow = homeState.filteredJobs.slice(startIndex, endIndex);

    // Clear existing jobs
    jobListingsContainer.innerHTML = '';

    // Add jobs to DOM
    if (jobsToShow.length === 0) {
        jobListingsContainer.innerHTML = `
            <div class="no-jobs-message">
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
    } else {
        jobsToShow.forEach(job => {
            const jobCard = createJobCard(job);
            jobListingsContainer.innerHTML += jobCard;
        });
    }

    // Update job count
    if (jobCount) {
        const totalJobs = homeState.filteredJobs.length;
        const showingJobs = Math.min(homeState.currentPage * homeState.jobsPerPage, totalJobs);
        jobCount.textContent = `Showing ${showingJobs} of ${totalJobs} jobs`;
    }

    // Toggle load more button
    toggleLoadMoreButton();
}

function createJobCard(job) {
    const isSaved = state.savedJobs.has(job.id);
    const isMobile = window.innerWidth < 768;
    const descriptionLength = isMobile ? 80 : 120;

    return `
        <div class="job-card ${job.isFeatured ? 'featured' : ''}" data-job-id="${job.id}">
            ${job.isFeatured ? '<div class="featured-badge">⭐ Featured</div>' : ''}
            
            <div class="job-header">
                <div class="company-info">
                    <div class="company-logo">
                        <i class="fas fa-building"></i>
                    </div>
                    <div>
                        <h3 class="job-title">${escapeHTML(job.title)}</h3>
                        <p class="job-company">${escapeHTML(job.company)}</p>
                        ${job.isRemote ? '<span class="remote-badge"><i class="fas fa-home"></i> Remote</span>' : ''}
                    </div>
                </div>
                <span class="job-salary">${formatSalary(job.salary)}</span>
            </div>
            
            <div class="job-details">
                <span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(job.location)}</span>
                <span><i class="fas fa-briefcase"></i> ${job.type}</span>
                <span><i class="fas fa-user-tie"></i> ${job.experience}</span>
            </div>
            
            <div class="job-description">
                <p>${escapeHTML(truncateText(job.description, descriptionLength))}</p>
            </div>
            
            <div class="job-footer">
                <div class="job-meta">
                    <span class="post-date">${formatRelativeTime(job.createdAt)}</span>
                </div>
                
                <div class="job-actions">
                    <button class="btn btn-primary btn-apply" data-id="${job.id}">
                        ${isMobile ? '<i class="fas fa-paper-plane"></i>' : 'Apply Now'}
                    </button>
                    <button class="btn-save ${isSaved ? 'active' : ''}" data-id="${job.id}">
                        <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function clearFiltersHandler() {
    // Reset filter values
    homeState.filters = {
        search: '',
        location: '',
        category: '',
        experience: '',
        salary: ''
    };

    // Reset UI elements
    const jobSearch = document.getElementById('jobSearch');
    const locationSearch = document.getElementById('locationSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const cityFilter = document.getElementById('cityFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const salaryFilter = document.getElementById('salaryFilter');

    if (jobSearch) jobSearch.value = '';
    if (locationSearch) locationSearch.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (cityFilter) cityFilter.value = '';
    if (experienceFilter) experienceFilter.value = '';
    if (salaryFilter) salaryFilter.value = '';

    // Re-filter jobs
    filterJobs();
    showNotification('Filters cleared', 'info');
}

function loadMoreJobsHandler() {
    if (state.isLoading || !homeState.hasMoreJobs) return;

    state.isLoading = true;
    const loadMoreBtn = document.getElementById('loadMoreJobs');

    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }

    setTimeout(() => {
        homeState.currentPage++;
        homeState.hasMoreJobs = homeState.currentPage * homeState.jobsPerPage < homeState.filteredJobs.length;

        renderJobs();

        state.isLoading = false;
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Load More Jobs';
            loadMoreBtn.disabled = false;
        }
    }, 500);
}

function toggleLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreJobs');
    if (!loadMoreBtn) return;

    if (homeState.currentPage * homeState.jobsPerPage < homeState.filteredJobs.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function applyForJob(jobId) {
    if (!state.currentUser) {
        showNotification('Please login to apply for jobs', 'warning');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) openModal(loginModal);
        return;
    }

    showNotification('Application submitted successfully!', 'success');
}

function toggleSaveJob(jobId, button) {
    if (state.savedJobs.has(jobId)) {
        state.savedJobs.delete(jobId);
        if (button) {
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-bookmark"></i>';
        }
        showNotification('Job removed from saved jobs', 'info');
    } else {
        state.savedJobs.add(jobId);
        if (button) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-bookmark"></i>';
        }
        showNotification('Job saved successfully!', 'success');
    }

    localStorage.setItem('savedJobs', JSON.stringify([...state.savedJobs]));
}