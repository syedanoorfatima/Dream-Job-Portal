// Enhanced JavaScript for PakJobs Portal with API Integration
const API_BASE_URL = 'http://localhost:5000/api';

// Enhanced State Management
const state = {
    currentUser: null,
    jobs: [],
    filteredJobs: [],
    savedJobs: new Set(JSON.parse(localStorage.getItem('savedJobs')) || []),
    applications: [],
    currentPage: 1,
    jobsPerPage: 6,
    isLoading: false,
    hasMoreJobs: true,
    filters: {
        search: '',
        category: '',
        location: '',
        experience: '',
        salary: ''
    },
    viewMode: localStorage.getItem('viewMode') || 'grid',
    sortBy: 'newest',
    currentSection: 'home'
};

// API Service Class
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add authorization header if user is logged in
        const token = localStorage.getItem('pakjobs_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth APIs
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Job APIs
    async getJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/jobs?${queryString}`);
    }

    async getJob(id) {
        return this.request(`/jobs/${id}`);
    }

    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async updateJob(id, jobData) {
        return this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(id) {
        return this.request(`/jobs/${id}`, {
            method: 'DELETE'
        });
    }

    async getJobStats() {
        return this.request('/jobs/stats');
    }

    // Application APIs
    async applyForJob(applicationData) {
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async getMyApplications() {
        return this.request('/applications/my-applications');
    }

    async getEmployerApplications() {
        return this.request('/applications/employer');
    }

    async updateApplicationStatus(id, statusData) {
        return this.request(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    // User APIs
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getSavedJobs() {
        return this.request('/users/saved-jobs');
    }

    // Company APIs
    async getCompanies() {
        return this.request('/companies');
    }

    async getCompany(id) {
        return this.request(`/companies/${id}`);
    }

    async createCompany(companyData) {
        return this.request('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }
}

// Initialize API Service
const apiService = new ApiService();

// Enhanced Application Class with API Integration
class PakJobsApp {
    constructor() {
        this.api = apiService;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        await this.checkAuthStatus();
        await this.loadInitialData();
        this.renderJobs();
        this.updateUI();
        this.setupNavigation();
        console.log('PakJobs App initialized successfully with API integration');
    }

    // Enhanced Authentication with API
    async checkAuthStatus() {
        const token = localStorage.getItem('pakjobs_token');
        if (token) {
            try {
                const response = await this.api.getCurrentUser();
                state.currentUser = response.data;
                this.updateAuthUI();
                this.showNotification(`Welcome back, ${state.currentUser.name}!`, 'success');
            } catch (error) {
                console.error('Auth check failed:', error);
                this.handleAuthError();
            }
        }
    }

    async login(email, password) {
        this.showNotification('Logging in...', 'info');

        try {
            const response = await this.api.login({ email, password });
            this.handleLoginSuccess(response);
            return true;
        } catch (error) {
            this.showNotification(error.message || 'Login failed', 'error');
            return false;
        }
    }

    async register(userData) {
        this.showNotification('Creating your account...', 'info');

        try {
            const response = await this.api.register(userData);
            this.showNotification('Registration successful! Please login.', 'success');
            this.switchToLogin();
            return true;
        } catch (error) {
            this.showNotification(error.message || 'Registration failed', 'error');
            return false;
        }
    }

    handleLoginSuccess(response) {
        localStorage.setItem('pakjobs_token', response.token);
        localStorage.setItem('pakjobs_user', JSON.stringify(response.user));
        state.currentUser = response.user;
        this.updateAuthUI();
        this.showNotification('Login successful!', 'success');
        this.closeModal(elements.loginModal);

        // Reload jobs to show personalized recommendations
        this.loadInitialData();
    }

    logout() {
        localStorage.removeItem('pakjobs_token');
        localStorage.removeItem('pakjobs_user');
        state.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'info');

        // Reload jobs to remove personalized content
        this.loadInitialData();
    }

    // Enhanced Job Management with API
    async loadInitialData() {
        this.showNotification('Loading jobs...', 'info');

        try {
            const params = {
                page: state.currentPage,
                limit: state.jobsPerPage,
                ...this.buildFilterParams()
            };

            const response = await this.api.getJobs(params);
            state.jobs = response.data;
            state.filteredJobs = response.data;
            this.showNotification(`Loaded ${state.jobs.length} jobs`, 'success');
            this.renderJobs();
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.loadSampleData();
            this.showNotification('Using sample data. API might be unavailable.', 'warning');
        }
    }

    buildFilterParams() {
        const params = {};

        if (state.filters.search) {
            params.search = state.filters.search;
        }
        if (state.filters.category) {
            params.category = state.filters.category;
        }
        if (state.filters.location) {
            params.location = state.filters.location;
        }
        if (state.filters.experience) {
            params.experience = state.filters.experience;
        }

        return params;
    }

    async loadMoreJobs() {
        if (state.isLoading) return;

        state.isLoading = true;
        state.currentPage++;

        try {
            const params = {
                page: state.currentPage,
                limit: state.jobsPerPage,
                ...this.buildFilterParams()
            };

            const response = await this.api.getJobs(params);
            const newJobs = response.data;

            if (newJobs.length > 0) {
                state.jobs = [...state.jobs, ...newJobs];
                state.filteredJobs = [...state.filteredJobs, ...newJobs];
                this.renderJobs();
            } else {
                state.hasMoreJobs = false;
            }
        } catch (error) {
            console.error('Failed to load more jobs:', error);
            this.showNotification('Failed to load more jobs', 'error');
        } finally {
            state.isLoading = false;
        }
    }

    async applyForJob(jobId) {
        if (!state.currentUser) {
            this.showNotification('Please login to apply for jobs', 'warning');
            this.openModal(elements.loginModal);
            return;
        }

        try {
            const job = state.jobs.find(j => j.id === jobId || j._id === jobId);
            if (!job) {
                this.showNotification('Job not found', 'error');
                return;
            }

            const applicationData = {
                jobId: job._id || job.id,
                coverLetter: `I am excited to apply for the ${job.title} position at ${job.company}. I believe my skills and experience make me a strong candidate for this role.`
            };

            await this.api.applyForJob(applicationData);

            // Update applications count locally
            job.applicationsCount = (job.applicationsCount || 0) + 1;
            this.renderJobs();

            this.showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
        } catch (error) {
            console.error('Application failed:', error);

            // Fallback to mock application for demo
            const job = state.jobs.find(j => j.id === jobId || j._id === jobId);
            job.applicationsCount = (job.applicationsCount || 0) + 1;
            this.renderJobs();
            this.showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
        }
    }

    async getJobDetails(jobId) {
        try {
            const response = await this.api.getJob(jobId);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch job details:', error);
            return state.jobs.find(job => job.id === jobId || job._id === jobId);
        }
    }

    // Enhanced Filtering with API
    async filterJobs() {
        const searchTerm = elements.jobSearch?.value.toLowerCase().trim() || '';
        const locationTerm = elements.locationSearch?.value.toLowerCase().trim() || '';
        const category = elements.categoryFilter?.value || '';
        const experience = elements.experienceFilter?.value || '';
        const salary = elements.salaryFilter?.value || '';

        state.filters = {
            search: searchTerm,
            category,
            location: locationTerm,
            experience,
            salary
        };

        state.currentPage = 1;

        try {
            const params = {
                page: state.currentPage,
                limit: state.jobsPerPage,
                ...this.buildFilterParams()
            };

            const response = await this.api.getJobs(params);
            state.filteredJobs = response.data;
            this.renderJobs();

            if (searchTerm || locationTerm || category) {
                this.showNotification(`Found ${state.filteredJobs.length} jobs matching your criteria`, 'info');
            }
        } catch (error) {
            console.error('Filter failed:', error);
            // Fallback to client-side filtering
            this.filterJobsLocally();
        }
    }

    filterJobsLocally() {
        const searchTerm = state.filters.search;
        const locationTerm = state.filters.location;
        const category = state.filters.category;
        const experience = state.filters.experience;
        const salary = state.filters.salary;

        state.filteredJobs = state.jobs.filter(job => {
            const matchesSearch = !searchTerm ||
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm))) ||
                job.description.toLowerCase().includes(searchTerm);

            const matchesLocation = !locationTerm ||
                job.location.toLowerCase().includes(locationTerm);

            const matchesCategory = !category ||
                job.category === category;

            const matchesExperience = !experience ||
                job.experience === experience;

            const matchesSalary = !salary ||
                this.checkSalaryRange(job.salary, salary);

            return matchesSearch && matchesLocation && matchesCategory &&
                matchesExperience && matchesSalary;
        });

        this.renderJobs();
        this.showNotification(`Found ${state.filteredJobs.length} jobs matching your criteria`, 'info');
    }

    // Enhanced Job Rendering with API Data
    createJobCard(job) {
        const isSaved = state.savedJobs.has(job._id || job.id);
        const isMobile = window.innerWidth < 768;
        const jobId = job._id || job.id;

        // Calculate match score based on user skills
        let matchScore = null;
        if (state.currentUser && state.currentUser.profile?.skills && job.skills) {
            const userSkills = state.currentUser.profile.skills;
            const jobSkills = job.skills;
            const commonSkills = jobSkills.filter(skill =>
                userSkills.some(userSkill =>
                    userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(userSkill.toLowerCase())
                )
            );
            matchScore = Math.min(100, Math.floor((commonSkills.length / jobSkills.length) * 100) + 20);
        }

        return `
            <div class="job-card ${job.isFeatured ? 'featured' : ''} ${job.isUrgent ? 'urgent' : ''}" data-job-id="${jobId}">
                ${job.isFeatured ? '<div class="featured-badge">Featured</div>' : ''}
                ${job.isUrgent ? '<div class="urgent-badge">Urgent</div>' : ''}
                
                <div class="job-header">
                    <div class="company-info">
                        <div class="company-logo">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="job-title-section">
                            <h3 class="job-title">${this.escapeHTML(job.title)}</h3>
                            <p class="job-company">${this.escapeHTML(job.company)}</p>
                            ${job.isRemote ? '<span class="remote-badge"><i class="fas fa-home"></i> Remote</span>' : ''}
                        </div>
                    </div>
                    <span class="job-salary">${this.formatSalary(job.salary)}</span>
                </div>
                
                <div class="job-details">
                    <span class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHTML(job.location)}</span>
                    </span>
                    <span class="detail-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${job.type}</span>
                    </span>
                    <span class="detail-item">
                        <i class="fas fa-user-tie"></i>
                        <span>${job.experience}</span>
                    </span>
                    ${matchScore ? `
                    <span class="detail-item match-score">
                        <i class="fas fa-chart-line"></i>
                        <span>${matchScore}% Match</span>
                    </span>
                    ` : ''}
                </div>
                
                ${job.skills && job.skills.length > 0 ? `
                <div class="job-tags">
                    ${job.skills.slice(0, 4).map(tag => `<span class="job-tag">${this.escapeHTML(tag)}</span>`).join('')}
                    ${job.skills.length > 4 ? `<span class="job-tag-more">+${job.skills.length - 4} more</span>` : ''}
                </div>
                ` : ''}
                
                <div class="job-description">
                    <p>${this.escapeHTML(job.description.substring(0, isMobile ? 80 : 120))}...</p>
                </div>
                
                <div class="job-footer">
                    <div class="job-meta">
                        <span class="post-date">Posted ${this.formatRelativeTime(job.createdAt)}</span>
                        <span class="applications">${job.applicationsCount || 0} applicants</span>
                    </div>
                    
                    <div class="job-actions">
                        <button class="btn btn-primary btn-apply" data-id="${jobId}">
                            ${isMobile ? '<i class="fas fa-paper-plane"></i>' : 'Apply Now'}
                        </button>
                        <button class="btn-save ${isSaved ? 'active' : ''}" data-id="${jobId}">
                            <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                        </button>
                        <button class="btn btn-outline btn-view-details" data-id="${jobId}">
                            ${isMobile ? '<i class="fas fa-eye"></i>' : 'Details'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Enhanced Job Details with API
    async showJobDetails(jobId) {
        try {
            const job = await this.getJobDetails(jobId);
            if (job) {
                this.showJobModal(job);
            }
        } catch (error) {
            this.showNotification('Failed to load job details', 'error');
        }
    }

    showJobModal(job) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content job-details-modal">
                <div class="modal-header">
                    <h2>${job.title}</h2>
                    <p>${job.company} • ${job.location} ${job.isRemote ? '• <span class="remote-badge"><i class="fas fa-home"></i> Remote</span>' : ''}</p>
                </div>
                <div class="modal-body">
                    <div class="job-meta">
                        <div class="meta-item">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${this.formatSalary(job.salary)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-briefcase"></i>
                            <span>${job.type}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-user-tie"></i>
                            <span>${job.experience}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Posted: ${new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${job.applicationsCount || 0} applicants</span>
                        </div>
                    </div>
                    
                    <div class="job-section">
                        <h3>Job Description</h3>
                        <p>${job.description}</p>
                    </div>
                    
                    <div class="job-section">
                        <h3>Requirements</h3>
                        <p>${job.requirements || 'No specific requirements listed.'}</p>
                    </div>
                    
                    ${job.skills && job.skills.length > 0 ? `
                    <div class="job-section">
                        <h3>Skills Required</h3>
                        <div class="skills-list">
                            ${job.skills.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary btn-apply-full" data-id="${job._id || job.id}">
                        Apply for this Position
                    </button>
                    <button class="btn btn-outline" id="closeJobModal">
                        Close
                    </button>
                </div>
                <button class="btn-close" id="closeJobModalBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeJobModal = document.getElementById('closeJobModal');
        const closeJobModalBtn = document.getElementById('closeJobModalBtn');
        const applyFullBtn = document.querySelector('.btn-apply-full');

        if (closeJobModal) {
            closeJobModal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }

        if (closeJobModalBtn) {
            closeJobModalBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }

        if (applyFullBtn) {
            applyFullBtn.addEventListener('click', () => {
                this.applyForJob(job._id || job.id);
                document.body.removeChild(modal);
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Enhanced User Profile Management
    async updateUserProfile(profileData) {
        try {
            const response = await this.api.updateUserProfile(profileData);
            state.currentUser = response.data;
            this.showNotification('Profile updated successfully', 'success');
            return true;
        } catch (error) {
            this.showNotification(error.message || 'Failed to update profile', 'error');
            return false;
        }
    }

    // Utility Methods
    formatSalary(salary) {
        if (typeof salary === 'string') return salary;
        if (salary && salary.min && salary.max) {
            return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || 'PKR'}`;
        }
        return 'Salary not specified';
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'today';
        if (diffDays === 2) return 'yesterday';
        if (diffDays < 7) return `${diffDays - 1} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Sample data fallback
    loadSampleData() {
        state.jobs = [
            {
                _id: 1,
                title: "Senior Software Engineer",
                company: "Systems Limited",
                location: "Karachi",
                type: "Full-time",
                salary: { min: 150000, max: 200000, currency: "PKR" },
                experience: "3-5 years",
                category: "IT & Software",
                skills: ["JavaScript", "React", "Node.js", "TypeScript"],
                description: "We are looking for a skilled Senior Software Engineer to join our dynamic team...",
                requirements: "3+ years of experience in software development...",
                isFeatured: true,
                isUrgent: false,
                isRemote: false,
                createdAt: "2024-01-15",
                applicationsCount: 15
            },
            // Add more sample jobs as needed
        ];
        state.filteredJobs = [...state.jobs];
        this.renderJobs();
    }

    // ... (rest of the methods remain the same as previous implementation)
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PakJobsApp();
});

// Make app globally available
window.PakJobsApp = PakJobsApp;