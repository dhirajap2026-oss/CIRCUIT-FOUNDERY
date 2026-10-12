// CircuitFoundry Application Main JavaScript
class CircuitFoundryApp {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.checkAuthState();
        this.initAnimations();
        this.loadComponents();
        this.loadProjects();
    }

    cacheElements() {
        this.elements = {
            navToggle: document.getElementById('nav-toggle'),
            mainNav: document.getElementById('main-nav'),
            authSection: document.getElementById('auth-section'),
            userSection: document.getElementById('user-section'),
            usernameDisplay: document.getElementById('username-display'),
            dashboardSection: document.getElementById('dashboard-section'),
            componentsGrid: document.getElementById('components-grid'),
            componentsCount: document.getElementById('components-count'),
            inventoryList: document.getElementById('inventory-list'),
            projectResultsGrid: document.getElementById('project-results-grid'),
            savedProjectsGrid: document.getElementById('saved-projects-grid'),
            savedProjectsList: document.getElementById('saved-projects-list'),
            emptySavedProjects: document.getElementById('empty-saved-projects'),
            componentModal: document.getElementById('component-modal'),
            modalTitle: document.getElementById('modal-title'),
            componentSelect: document.getElementById('component-select'),
            componentQuantity: document.getElementById('component-quantity'),
            componentStatus: document.getElementById('component-status'),
            customComponentFields: document.getElementById('custom-component-fields'),
            customComponentName: document.getElementById('custom-component-name'),
            customComponentPrice: document.getElementById('custom-component-price'),
            inventorySearchInput: document.getElementById('inventory-search-input'),
            categoryList: document.getElementById('category-list'),
            filterAvailable: document.getElementById('filter-available'),
            filterPartial: document.getElementById('filter-partial'),
            filterUnavailable: document.getElementById('filter-unavailable'),
            profileForm: document.getElementById('profile-form'),
            preferencesForm: document.getElementById('preferences-form'),
            securityForm: document.getElementById('security-form'),
            importFile: document.getElementById('import-file'),
            importPreview: document.getElementById('import-preview'),
            importPreviewText: document.getElementById('import-preview-text'),
            confirmUsername: document.getElementById('confirm-username'),
            confirmPassword: document.getElementById('confirm-password'),
            confirmDeletion: document.getElementById('confirm-deletion'),
            componentForm: document.getElementById('component-form'),
            deleteAccountForm: document.getElementById('delete-account-form'),
        };

        this.state = {
            currentUser: null,
            components: [],
            projects: [],
            inventory: [],
            savedProjects: [],
            filters: {
                components: {
                    search: '',
                    category: '',
                    priceRange: '',
                    sort: 'name-asc'
                },
                projects: {
                    search: '',
                    category: '',
                    difficulty: '',
                    matchingMode: 'budget',
                    sort: 'match-score'
                }
            },
            editingInventory: false,
            selectedComponents: new Set(),
            currentProjectView: 'grid',
            savedProjectsView: 'grid'
        };
    }

    attachEventListeners() {
        // Navigation toggle
        this.elements.navToggle?.addEventListener('click', () => this.toggleNavigation());

        // Auth forms
        const signupForm = document.getElementById('signup-form');
        const loginForm = document.getElementById('login-form');

        signupForm?.addEventListener('submit', (e) => this.handleSignup(e));
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

        // Password toggles
        const passwordToggle = document.getElementById('password-toggle');
        const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
        const loginPasswordToggle = document.getElementById('login-password-toggle');

        passwordToggle?.addEventListener('click', () => this.togglePasswordVisibility('password'));
        confirmPasswordToggle?.addEventListener('click', () => this.togglePasswordVisibility('confirm-password'));
        loginPasswordToggle?.addEventListener('click', () => this.togglePasswordVisibility('login-password'));

        // Component search and filters
        const componentSearch = document.getElementById('component-search');
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const sortSelect = document.getElementById('sort-select');

        componentSearch?.addEventListener('input', () => this.handleComponentSearch());
        categoryFilter?.addEventListener('change', () => this.handleComponentFilter());
        priceFilter?.addEventListener('change', () => this.handleComponentFilter());
        sortSelect?.addEventListener('change', () => this.handleComponentSort());

        // Inventory search
        this.elements.inventorySearchInput?.addEventListener('input', () => this.handleInventorySearch());

        // Category filters
        this.elements.categoryList?.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleCategoryFilter(e));
        });

        // Availability filters
        this.elements.filterAvailable?.addEventListener('change', () => this.handleInventoryFilter());
        this.elements.filterPartial?.addEventListener('change', () => this.handleInventoryFilter());
        this.elements.filterUnavailable?.addEventListener('change', () => this.handleInventoryFilter());

        // Project finder controls
        const projectBudget = document.getElementById('project-budget');
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        const matchingMode = document.getElementById('matching-mode');
        const resultsSort = document.getElementById('results-sort');

        projectBudget?.addEventListener('input', () => this.handleBudgetChange());
        categoryFilter?.addEventListener('change', () => this.handleProjectFilter());
        difficultyFilter?.addEventListener('change', () => this.handleProjectFilter());
        matchingMode?.addEventListener('change', () => this.handleProjectFilter());
        resultsSort?.addEventListener('change', () => this.handleProjectSort());

        // Saved projects controls
        const savedProjectsSearch = document.getElementById('saved-projects-search');
        savedProjectsSearch?.addEventListener('input', () => this.handleSavedProjectsSearch());

        // Profile tabs
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Form submissions
        this.elements.componentForm?.addEventListener('submit', (e) => this.handleComponentFormSubmit(e));
        this.elements.profileForm?.addEventListener('submit', (e) => this.handleProfileFormSubmit(e));
        this.elements.preferencesForm?.addEventListener('submit', (e) => this.handlePreferencesFormSubmit(e));
        this.elements.securityForm?.addEventListener('submit', (e) => this.handleSecurityFormSubmit(e));
        this.elements.deleteAccountForm?.addEventListener('submit', (e) => this.handleDeleteAccountSubmit(e));

        // Import modal
        const importFile = document.getElementById('import-file');
        importFile?.addEventListener('change', () => this.handleImportFileSelect());

        // Export buttons
        const exportBtn = document.querySelector('.btn-export');
        exportBtn?.addEventListener('click', () => this.exportData());

        // Global event listeners
        window.addEventListener('storage', () => this.handleStorageChange());
        window.addEventListener('resize', () => this.handleResize());
    }

    initAnimations() {
        // Initialize scroll animations if anime.js is available
        if (typeof anime !== 'undefined') {
            this.initScrollAnimations();
        }
    }

    checkAuthState() {
        const currentUser = localStorage.getItem('circuitfoundry_current_user');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            this.state.currentUser = userData;
            this.updateUIForAuthenticatedUser(userData);
            this.loadUserData(userData.userId);
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    updateUIForAuthenticatedUser(user) {
        this.elements.authSection?.classList.add('hidden');
        this.elements.userSection?.classList.remove('hidden');
        this.elements.usernameDisplay.textContent = user.username;
        this.elements.dashboardSection?.classList.remove('hidden');
    }

    updateUIForUnauthenticatedUser() {
        this.elements.authSection?.classList.remove('hidden');
        this.elements.userSection?.classList.add('hidden');
        this.elements.dashboardSection?.classList.add('hidden');
    }

    async loadComponents() {
        try {
            // Try to load from localStorage first
            let components = JSON.parse(localStorage.getItem('circuitfoundry_components') || '[]');

            // If empty, try to load from database file
            if (components.length === 0) {
                // In a real implementation, this would fetch from components.json
                // For now, we'll use some default components
                components = this.getDefaultComponents();
                localStorage.setItem('circuitfoundry_components', JSON.stringify(components));
            }

            this.state.components = components;
            this.renderComponents();
            this.updateComponentsCount();
        } catch (error) {
            console.error('Error loading components:', error);
            this.showError('Failed to load components');
        }
    }

    async loadProjects() {
        try {
            // Try to load from localStorage first
            let projects = JSON.parse(localStorage.getItem('circuitfoundry_projects') || '[]');

            // If empty, try to load from database file
            if (projects.length === 0) {
                // In a real implementation, this would fetch from projects.json
                // For now, we'll use some default projects
                projects = this.getDefaultProjects();
                localStorage.setItem('circuitfoundry_projects', JSON.stringify(projects));
            }

            this.state.projects = projects;
            this.renderProjectResults();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showError('Failed to load projects');
        }
    }

    getDefaultComponents() {
        return [
            {
                id: 'COMP001',
                name: 'Resistor 220 Ohm',
                category: 'Resistors',
                description: '220-ohm resistor for current limiting and basic circuits.',
                price: 2,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    resistance: '220 ohm',
                    power: '0.25 W'
                },
                compatibleProjects: ['PROJECT001', 'PROJECT003', 'PROJECT006']
            },
            {
                id: 'COMP002',
                name: 'Capacitor 10uF',
                category: 'Capacitors',
                description: '10-microfarad electrolytic capacitor for power supply filtering.',
                price: 4,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    capacitance: '10 uF',
                    voltage: '25 V'
                },
                compatibleProjects: ['PROJECT001', 'PROJECT004', 'PROJECT005']
            },
            {
                id: 'COMP003',
                name: 'Red LED',
                category: 'LEDs',
                description: 'Standard red LED for indicator lights.',
                price: 1,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    wavelength: 'Red',
                    forwardVoltage: '2.0 V'
                },
                compatibleProjects: ['PROJECT001', 'PROJECT002', 'PROJECT009', 'PROJECT012']
            }
        ];
    }

    getDefaultProjects() {
        return [
            {
                id: 'PROJECT001',
                name: 'Automatic Night Lamp',
                category: 'Home Automation',
                difficulty: 'Beginner',
                description: 'An LDR-based circuit that controls an LED according to ambient light.',
                estimatedBuildTime: '1-2 hours',
                budget: 150,
                components: [
                    {
                        componentId: 'COMP001',
                        name: 'Resistor 220 Ohm',
                        quantity: 2,
                        unitPrice: 2,
                        totalPrice: 4
                    }
                ],
                instructions: [
                    'Prepare the required components.',
                    'Build the circuit on a breadboard.',
                    'Check the connections before applying power.'
                ],
                learningOutcomes: [
                    'Understand light-dependent resistance.',
                    'Learn basic circuit connections.'
                ],
                safetyNotes: [
                    'Use a suitable low-voltage power supply.'
                ]
            }
        ];
    }

    renderComponents() {
        if (!this.elements.componentsGrid) return;

        const filteredComponents = this.filterComponents();
        const sortedComponents = this.sortComponents(filteredComponents);

        if (sortedComponents.length === 0) {
            this.elements.componentsGrid.innerHTML = '
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3 class="empty-title">No Components Found</h3>
                    <p class="empty-description">Try adjusting your search or filters</p>
                </div>
            ';
            return;
        }

        this.elements.componentsGrid.innerHTML = sortedComponents.map(component => `
            <div class="component-card" onclick="app.selectComponent('${component.id}')">
                <img src="assets/icons/component-icon.png" alt="${component.name}" class="component-image">
                <div class="component-info">
                    <h3 class="component-name">${component.name}</h3>
                    <div class="component-category">${component.category}</div>
                    <p class="component-description">${component.description}</p>
                    <div class="component-price">₹${component.price}</div>
                </div>
                <div class="component-actions">
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); app.addComponentToInventory('${component.id}')">Add to Inventory</button>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); app.viewComponentDetails('${component.id}')">Details</button>
                </div>
            </div>
        `).join('');
    }

    filterComponents() {
        const { search, category, priceRange, sort } = this.state.filters.components;

        return this.state.components.filter(component => {
            if (search && !component.name.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            if (category && category !== '' && component.category !== category) {
                return false;
            }

            if (priceRange) {
                const [min, max] = priceRange.split('-');
                const price = component.price;
                if (min && price < parseInt(min)) return false;
                if (max && max !== '+' && price > parseInt(max)) return false;
            }

            return true;
        });
    }

    sortComponents(components) {
        const { sort } = this.state.filters.components;

        const sorted = [...components];

        switch (sort) {
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
        }

        return sorted;
    }

    renderProjectResults() {
        if (!this.elements.projectResultsGrid) return;

        const budget = parseInt(document.getElementById('project-budget')?.value) || 0;
        const { search, category, difficulty, matchingMode } = this.state.filters.projects;

        let filteredProjects = this.state.projects.filter(project => {
            if (search && !project.name.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            if (category && category !== '' && project.category !== category) {
                return false;
            }

            if (difficulty && difficulty !== '' && project.difficulty !== difficulty) {
                return false;
            }

            return true;
        });

        // Apply matching algorithm
        const matchedProjects = this.matchProjects(filteredProjects, budget, matchingMode);

        // Sort results
        matchedProjects.sort((a, b) => {
            const { sort } = this.state.filters.projects;
            switch (sort) {
                case 'match-score':
                    return b.matchScore - a.matchScore;
                case 'budget-needed':
                    return a.additionalCost - b.additionalCost;
                case 'cost-desc':
                    return b.additionalCost - a.additionalCost;
                case 'owned-count':
                    return b.componentsOwned - a.componentsOwned;
                case 'budget-desc':
                    return b.fullProjectCost - a.fullProjectCost;
                default:
                    return b.matchScore - a.matchScore;
            }
        });

        if (matchedProjects.length === 0) {
            this.elements.projectResultsGrid.innerHTML = '
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3 class="empty-title">No Projects Found</h3>
                    <p class="empty-description">Enter your budget and components to find projects</p>
                </div>
            ';
            return;
        }

        this.elements.projectResultsGrid.innerHTML = matchedProjects.map(project => `
            <div class="project-card" onclick="app.selectProject('${project.id}')">
                <div class="project-header">
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-difficulty ${project.difficulty.toLowerCase()}">${project.difficulty}</span>
                </div>
                <div class="project-meta">
                    <span>${project.category}</span>
                    <span>${project.estimatedBuildTime}</span>
                </div>
                <div class="project-cost">
                    <span>Full Cost: ₹${project.fullProjectCost}</span>
                    <span class="project-missing-cost">Additional Cost: ₹${project.additionalCost}</span>
                </div>
                <div class="project-match-indicator ${project.matchClass}">${project.matchLabel}</div>
                <div class="project-components-summary">
                    <div class="components-owned">
                        <strong>Owned:</strong> ${project.componentsOwned}/${project.totalComponents}
                    </div>
                    <div class="components-missing">
                        <strong>Missing:</strong> ${project.componentsMissing}
                    </div>
                </div>
                <div class="budget-remaining ${project.budgetRemainingClass}">
                    Budget Remaining: ₹${project.budgetRemaining}
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); app.viewProjectDetails('${project.id}')">View Details</button>
                    <button class="btn btn-outline" onclick="event.stopPropagation(); app.saveProject('${project.id}')">Save Project</button>
                </div>
            </div>
        `).join('');
    }

    matchProjects(projects, budget, matchingMode) {
        return projects.map(project => {
            const { inventory } = this.state;
            const { components } = this.state;

            // Calculate full project cost
            const fullProjectCost = project.components.reduce((sum, comp) => {
                const component = components.find(c => c.id === comp.componentId);
                return sum + (component ? component.price * comp.quantity : comp.unitPrice * comp.quantity);
            }, 0);

            // Calculate owned components and additional cost
            let componentsOwned = 0;
            let componentsMissing = 0;
            let additionalCost = 0;

            project.components.forEach(reqComp => {
                const component = components.find(c => c.id === reqComp.componentId);
                if (!component) return;

                const inventoryItem = inventory.find(inv => inv.componentId === reqComp.componentId);
                const ownedQuantity = inventoryItem ? inventoryItem.quantity : 0;
                const requiredQuantity = reqComp.quantity;

                if (ownedQuantity >= requiredQuantity) {
                    componentsOwned++;
                } else {
                    componentsMissing++;
                    additionalCost += (requiredQuantity - ownedQuantity) * component.price;
                }
            });

            // Calculate match score based on matching mode
            let matchScore = 0;
            let matchClass = 'match';
            let matchLabel = 'Good Match';

            switch (matchingMode) {
                case 'budget':
                    if (additionalCost <= budget) {
                        matchScore = 100 - (additionalCost / Math.max(budget, 1)) * 50;
                        matchScore += (componentsOwned / project.components.length) * 50;
                    } else {
                        matchScore = 0;
                        matchClass = 'exceeds-budget';
                        matchLabel = 'Exceeds Budget';
                    }
                    break;

                case 'fewest':
                    matchScore = 100 - additionalCost / Math.max(budget, 1) * 100;
                    break;

                case 'most':
                    matchScore = (componentsOwned / project.components.length) * 100;
                    if (additionalCost > budget) {
                        matchScore *= 0.5;
                        matchClass = 'exceeds-budget';
                        matchLabel = 'Exceeds Budget';
                    }
                    break;

                case 'all':
                    matchScore = 50 - additionalCost / Math.max(budget, 1) * 50;
                    if (additionalCost > budget) {
                        matchClass = 'exceeds-budget';
                        matchLabel = 'Exceeds Budget';
                    }
                    break;
            }

            matchScore = Math.max(0, Math.min(100, matchScore));

            return {
                ...project,
                fullProjectCost,
                componentsOwned,
                componentsMissing,
                additionalCost,
                matchScore,
                matchClass,
                matchLabel,
                budgetRemaining: budget - additionalCost
            };
        });
    }

    toggleNavigation() {
        this.elements.mainNav?.classList.toggle('open');
        this.elements.navToggle?.classList.toggle('active');
    }

    togglePasswordVisibility(fieldId) {
        const passwordInput = document.getElementById(fieldId);
        const toggle = passwordInput.closest('.password-input-wrapper').querySelector('.password-toggle');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.querySelector('.toggle-icon').textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggle.querySelector('.toggle-icon').textContent = '👁️';
        }
    }

    handleComponentSearch() {
        this.state.filters.components.search = this.elements.componentsGrid?.querySelector('#component-search')?.value || '';
        this.renderComponents();
    }

    handleComponentFilter() {
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');

        this.state.filters.components.category = categoryFilter?.value || '';
        this.state.filters.components.priceRange = priceFilter?.value || '';

        this.renderComponents();
    }

    handleComponentSort() {
        const sortSelect = document.getElementById('sort-select');
        this.state.filters.components.sort = sortSelect?.value || 'name-asc';
        this.renderComponents();
    }

    handleInventorySearch() {
        this.handleInventoryFilter();
    }

    handleCategoryFilter(e) {
        e.stopPropagation();

        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        e.target.classList.add('active');

        const category = e.target.dataset.category;
        // Handle category filtering logic
    }

    handleInventoryFilter() {
        const searchTerm = this.elements.inventorySearchInput?.value.toLowerCase() || '';
        const showAvailable = this.elements.filterAvailable?.checked;
        const showPartial = this.elements.filterPartial?.checked;
        const showUnavailable = this.elements.filterUnavailable?.checked;

        let filteredInventory = this.state.inventory.filter(item => {
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) {
                return false;
            }

            if (!showAvailable && item.status === 'available') {
                return false;
            }

            if (!showPartial && item.status === 'partial') {
                return false;
            }

            if (!showUnavailable && item.status === 'unavailable') {
                return false;
            }

            return true;
        });

        this.renderInventoryList(filteredInventory);
    }

    renderInventoryList(inventory) {
        if (!this.elements.inventoryList) return;

        if (inventory.length === 0) {
            this.elements.inventoryList.innerHTML = '
                <div class="empty-inventory">No components match your current filters</div>
            ';
            return;
        }

        this.elements.inventoryList.innerHTML = inventory.map(item => `
            <div class="inventory-item ${this.state.selectedComponents.has(item.id) ? 'selected' : ''}" onclick="app.toggleComponentSelection('${item.id}')">
                <div class="inventory-item-info">
                    <div class="inventory-item-name">${item.name}</div>
                    <div class="inventory-item-details">
                        <span>${item.category}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>Price: ₹${item.price}</span>
                        <span>Status: <span class="status-${item.status}">${item.status}</span></span>
                    </div>
                </div>
                <div class="inventory-quantity">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="event.stopPropagation(); app.updateInventoryQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="event.stopPropagation(); app.updateInventoryQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="inventory-status">
                    <select class="status-select" onchange="event.stopPropagation(); app.updateInventoryStatus('${item.id}', this.value)" disabled="${!this.state.editingInventory}">
                        <option value="available" ${item.status === 'available' ? 'selected' : ''}>Available</option>
                        <option value="partial" ${item.status === 'partial' ? 'selected' : ''}>Partial</option>
                        <option value="unavailable" ${item.status === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                    </select>
                </div>
                <div class="inventory-actions">
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); app.viewComponentDetails('${item.componentId}')">View</button>
                    <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); app.removeComponentFromInventory('${item.id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    toggleComponentSelection(componentId) {
        if (this.state.selectedComponents.has(componentId)) {
            this.state.selectedComponents.delete(componentId);
        } else {
            this.state.selectedComponents.add(componentId);
        }

        this.renderInventoryList(this.state.inventory);
    }

    async updateInventoryQuantity(componentId, change) {
        const inventoryItem = this.state.inventory.find(item => item.componentId === componentId);
        if (!inventoryItem) return;

        const newQuantity = inventoryItem.quantity + change;
        if (newQuantity < 0) return;

        inventoryItem.quantity = newQuantity;

        await this.saveUserData();
        this.renderInventoryList(this.state.inventory);
        this.updateDashboard();
    }

    async updateInventoryStatus(componentId, status) {
        const inventoryItem = this.state.inventory.find(item => item.componentId === componentId);
        if (!inventoryItem) return;

        inventoryItem.status = status;

        await this.saveUserData();
        this.renderInventoryList(this.state.inventory);
    }

    async addComponentToInventory(componentId) {
        const component = this.state.components.find(c => c.id === componentId);
        if (!component) return;

        const existingItem = this.state.inventory.find(item => item.componentId === componentId);

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.status = existingItem.quantity > 0 ? 'available' : 'unavailable';
        } else {
            this.state.inventory.push({
                id: `inv_${Date.now()}_${componentId}`,
                componentId,
                name: component.name,
                category: component.category,
                quantity: 1,
                price: component.price,
                status: 'available'
            });
        }

        await this.saveUserData();
        this.renderInventoryList(this.state.inventory);
        this.updateDashboard();
        this.closeComponentModal();
    }

    async removeComponentFromInventory(itemId) {
        this.state.inventory = this.state.inventory.filter(item => item.id !== itemId);

        await this.saveUserData();
        this.renderInventoryList(this.state.inventory);
        this.updateDashboard();
    }

    async saveComponent(customComponent) {
        const newComponent = {
            id: `COMP${String(this.state.components.length + 1).padStart(3, '0')}`,
            ...customComponent
        };

        this.state.components.push(newComponent);
        await this.saveUserData();
        this.renderComponents();
        this.updateComponentsCount();
    }

    exportInventory() {
        const data = {
            inventory: this.state.inventory,
            savedProjects: this.state.savedProjects,
            preferences: this.state.preferences,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuitfoundry_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Inventory exported successfully');
    }

    showImportModal() {
        this.openModal('component-modal');
        this.elements.modalTitle.textContent = 'Import Inventory';
    }

    async handleImportFileSelect() {
        const fileInput = this.elements.importFile;
        const file = fileInput.files?.[0];

        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (data.inventory) {
                this.state.inventory = data.inventory;
            }

            if (data.savedProjects) {
                this.state.savedProjects = data.savedProjects;
            }

            if (data.preferences) {
                this.state.preferences = data.preferences;
            }

            await this.saveUserData();
            this.renderInventoryList(this.state.inventory);
            this.renderSavedProjects();

            this.showSuccess('Inventory imported successfully');
            this.closeImportModal();
        } catch (error) {
            this.showError('Failed to import inventory. Please check the file format.');
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.add('open');
    }

    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }

    async saveUserData() {
        if (!this.state.currentUser) return;

        const userData = {
            inventory: this.state.inventory,
            savedProjects: this.state.savedProjects,
            preferences: this.state.preferences,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(`circuitfoundry_inventory_${this.state.currentUser.userId}`, JSON.stringify(userData));
    }

    loadUserData(userId) {
        const userData = localStorage.getItem(`circuitfoundry_inventory_${userId}`);
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                this.state.inventory = parsed.inventory || [];
                this.state.savedProjects = parsed.savedProjects || [];
                this.state.preferences = parsed.preferences || {};
                this.renderInventoryList(this.state.inventory);
                this.renderSavedProjects();
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        this.updateDashboard();
    }

    updateDashboard() {
        const totalComponents = this.state.inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = this.state.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        if (this.elements.dashboardBudget) {
            this.elements.dashboardBudget.textContent = `₹${this.state.preferences.budget || 0}`;
        }

        if (this.elements.dashboardComponents) {
            this.elements.dashboardComponents.textContent = totalComponents.toString();
        }

        if (this.elements.dashboardSavedProjects) {
            this.elements.dashboardSavedProjects.textContent = this.state.savedProjects.length.toString();
        }
    }

    updateComponentsCount() {
        if (this.elements.componentsCount) {
            this.elements.componentsCount.textContent = this.state.components.length.toString();
        }
    }

    initScrollAnimations() {
        // Initialize scroll animations using anime.js
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.className.match(/fade-in-up|fade-in-left|fade-in-right|scale-in/)[0];

                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: animation.includes('Up') ? [30, 0] :
                                     animation.includes('Left') ? [-30, 0] :
                                     animation.includes('Right') ? [30, 0] : 0,
                        translateX: animation.includes('Left') ? [-30, 0] :
                                     animation.includes('Right') ? [30, 0] : 0,
                        scale: animation.includes('scale') ? [0.9, 1] : 1,
                        duration: 800,
                        easing: 'easeOutQuad'
                    });

                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    handleStorageChange() {
        // Handle storage changes from other tabs/windows
        if (this.state.currentUser) {
            this.loadUserData(this.state.currentUser.userId);
        }
    }

    handleResize() {
        // Handle responsive adjustments
        if (window.innerWidth > 768 && this.elements.mainNav?.classList.contains('open')) {
            this.toggleNavigation();
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Auth methods
    async handleSignup(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        // Validate form
        if (!username || !password || !confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        // Check if username already exists
        const existingUsers = JSON.parse(localStorage.getItem('circuitfoundry_users') || '[]');
        if (existingUsers.some(user => user.username === username)) {
            this.showError('Username already exists');
            return;
        }

        // Create user
        const userId = `user_${Date.now()}`;
        const user = {
            userId,
            username,
            email,
            createdAt: new Date().toISOString(),
            preferences: {}
        };

        // Hash password
        const passwordHash = await this.hashPassword(password);
        user.passwordHash = passwordHash;

        // Save user
        existingUsers.push(user);
        localStorage.setItem('circuitfoundry_users', JSON.stringify(existingUsers));

        // Set current user
        this.state.currentUser = user;
        localStorage.setItem('circuitfoundry_current_user', JSON.stringify(user));

        this.showSuccess('Account created successfully!');
        this.updateUIForAuthenticatedUser(user);
        this.loadUserData(userId);

        // Redirect to home page
        window.location.href = 'index.html';
    }

    async handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const usernameOrEmail = formData.get('login-username');
        const password = formData.get('login-password');

        // Find user
        const users = JSON.parse(localStorage.getItem('circuitfoundry_users') || '[]');
        const user = users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);

        if (!user) {
            this.showError('Invalid username or password');
            return;
        }

        // Verify password
        const passwordHash = await this.hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            this.showError('Invalid username or password');
            return;
        }

        // Set current user
        this.state.currentUser = user;
        localStorage.setItem('circuitfoundry_current_user', JSON.stringify(user));

        this.showSuccess('Logged in successfully!');
        this.updateUIForAuthenticatedUser(user);
        this.loadUserData(user.userId);

        // Redirect to home page
        window.location.href = 'index.html';
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));

        const key = await crypto.subtle.digest('SHA-256', data);
        const keyArray = new Uint8Array(key);

        return Array.from(keyArray, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    logout() {
        this.state.currentUser = null;
        localStorage.removeItem('circuitfoundry_current_user');

        this.showSuccess('Logged out successfully');
        this.updateUIForUnauthenticatedUser();

        // Redirect to login page
        window.location.href = 'login.html';
    }

    // Project management methods
    viewProjectDetails(projectId) {
        window.location.href = `project-details.html?id=${projectId}`;
    }

    saveProject(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const savedProject = {
            ...project,
            savedAt: new Date().toISOString(),
            savedBy: this.state.currentUser?.username || 'Anonymous'
        };

        this.state.savedProjects.push(savedProject);
        this.saveUserData();
        this.renderSavedProjects();

        this.showSuccess('Project saved successfully');
    }

    renderSavedProjects() {
        const searchTerm = document.getElementById('saved-projects-search')?.value.toLowerCase() || '';

        let filteredProjects = this.state.savedProjects.filter(project => {
            if (searchTerm && !project.name.toLowerCase().includes(searchTerm)) {
                return false;
            }
            return true;
        });

        if (this.state.savedProjectsView === 'grid') {
            if (!this.elements.savedProjectsGrid) return;

            if (filteredProjects.length === 0) {
                this.elements.savedProjectsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3 class="empty-title">No Saved Projects</h3>
                        <p class="empty-description">You haven't saved any projects yet. Find projects that match your budget and save them for later!</p>
                        <a href="projects.html" class="btn btn-primary">Find Projects</a>
                    </div>
                `;
                return;
            }

            this.elements.savedProjectsGrid.innerHTML = filteredProjects.map(project => `
                <div class="saved-project-item" onclick="app.selectSavedProject('${project.id}')">
                    <div class="saved-project-header">
                        <h3 class="saved-project-title">${project.name}</h3>
                        <span class="saved-project-category">${project.category}</span>
                    </div>
                    <div class="saved-project-meta">
                        <span>Difficulty: ${project.difficulty}</span>
                        <span>Saved: ${new Date(project.savedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="saved-project-actions">
                        <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); app.viewSavedProject('${project.id}')">View Details</button>
                        <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); app.deleteSavedProject('${project.id}')">Remove</button>
                    </div>
                </div>
            `).join('');
        } else {
            if (!this.elements.savedProjectsList) return;

            if (filteredProjects.length === 0) {
                this.elements.savedProjectsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3 class="empty-title">No Saved Projects</h3>
                        <p class="empty-description">You haven't saved any projects yet</p>
                    </div>
                `;
                return;
            }

            this.elements.savedProjectsList.innerHTML = filteredProjects.map(project => `
                <div class="saved-project-item" onclick="app.selectSavedProject('${project.id}')">
                    <div class="saved-project-header">
                        <h3 class="saved-project-title">${project.name}</h3>
                        <span class="saved-project-category">${project.category}</span>
                    </div>
                    <div class="saved-project-meta">
                        <span>Difficulty: ${project.difficulty}</span>
                        <span>Saved: ${new Date(project.savedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="saved-project-actions">
                        <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); app.viewSavedProject('${project.id}')">View Details</button>
                        <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); app.deleteSavedProject('${project.id}')">Remove</button>
                    </div>
                </div>
            `).join('');
        }
    }

    setSavedProjectsView(view) {
        this.state.savedProjectsView = view;

        document.querySelectorAll('.btn-outline').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.view-toggle button:nth-child(${view === 'grid' ? 1 : 2})`);
        activeBtn?.classList.add('active');

        if (view === 'grid') {
            this.elements.savedProjectsGrid?.classList.remove('hidden');
            this.elements.savedProjectsList?.classList.add('hidden');
        } else {
            this.elements.savedProjectsGrid?.classList.add('hidden');
            this.elements.savedProjectsList?.classList.remove('hidden');
        }

        this.renderSavedProjects();
    }

    handleSavedProjectsSearch() {
        this.renderSavedProjects();
    }

    handleTabSwitch(e) {
        e.preventDefault();

        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        e.target.classList.add('active');
        const tabId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        document.getElementById(tabId)?.classList.add('active');
    }

    // Utility methods
    openModal(modalId) {
        this.closeAllModals();
        this.openModal(modalId);
    }

    closeImportModal() {
        this.closeAllModals();
        document.getElementById('import-file').value = '';
    }

    showDeleteAccountModal() {
        this.openModal('delete-account-modal');
    }

    closeDeleteAccountModal() {
        this.closeAllModals();
        document.getElementById('confirm-username').value = '';
        document.getElementById('confirm-password').value = '';
        document.getElementById('confirm-deletion').checked = false;
    }

    handleResize() {
        if (window.innerWidth > 768 && this.elements.mainNav?.classList.contains('open')) {
            this.toggleNavigation();
        }
    }

    handleStorageChange() {
        if (this.state.currentUser) {
            this.loadUserData(this.state.currentUser.userId);
        }
    }

    // Project finder methods
    findProjects() {
        const budgetInput = document.getElementById('project-budget');
        if (!budgetInput) return;

        const budget = parseInt(budgetInput.value) || 0;
        const { search, category, difficulty, matchingMode } = this.state.filters.projects;

        const filteredProjects = this.state.projects.filter(project => {
            if (search && !project.name.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            if (category && category !== '' && project.category !== category) {
                return false;
            }

            if (difficulty && difficulty !== '' && project.difficulty !== difficulty) {
                return false;
            }

            return true;
        });

        const matchedProjects = this.matchProjects(filteredProjects, budget, matchingMode);

        matchedProjects.sort((a, b) => {
            const { sort } = this.state.filters.projects;
            switch (sort) {
                case 'match-score':
                    return b.matchScore - a.matchScore;
                case 'budget-needed':
                    return a.additionalCost - b.additionalCost;
                case 'cost-desc':
                    return b.additionalCost - a.additionalCost;
                case 'owned-count':
                    return b.componentsOwned - a.componentsOwned;
                case 'budget-desc':
                    return b.fullProjectCost - a.fullProjectCost;
                default:
                    return b.matchScore - a.matchScore;
            }
        });

        if (!this.elements.projectResultsGrid) return;

        if (matchedProjects.length === 0) {
            this.elements.projectResultsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3 class="empty-title">No Projects Found</h3>
                    <p class="empty-description">Enter your budget and components to find projects</p>
                </div>
            `;
            return;
        }

        this.elements.projectResultsGrid.innerHTML = matchedProjects.map(project => `
            <div class="project-card" onclick="app.selectProject('${project.id}')">
                <div class="project-header">
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-difficulty ${project.difficulty.toLowerCase()}">${project.difficulty}</span>
                </div>
                <div class="project-meta">
                    <span>${project.category}</span>
                    <span>${project.estimatedBuildTime}</span>
                </div>
                <div class="project-cost">
                    <span>Full Cost: ₹${project.fullProjectCost}</span>
                    <span class="project-missing-cost">Additional Cost: ₹${project.additionalCost}</span>
                </div>
                <div class="project-match-indicator ${project.matchClass}">${project.matchLabel}</div>
                <div class="project-components-summary">
                    <div class="components-owned">
                        <strong>Owned:</strong> ${project.componentsOwned}/${project.totalComponents}
                    </div>
                    <div class="components-missing">
                        <strong>Missing:</strong> ${project.componentsMissing}
                    </div>
                </div>
                <div class="budget-remaining ${project.budgetRemainingClass}">
                    Budget Remaining: ₹${project.budgetRemaining}
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); app.viewProjectDetails('${project.id}')">View Details</button>
                    <button class="btn btn-outline" onclick="event.stopPropagation(); app.saveProject('${project.id}')">Save Project</button>
                </div>
            </div>
        `).join('');
    }

    handleBudgetChange() {
        if (this.elements.projectResultsGrid?.children.length > 0) {
            this.findProjects();
        }
    }

    handleProjectFilter() {
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        const matchingMode = document.getElementById('matching-mode');

        this.state.filters.projects.category = categoryFilter?.value || '';
        this.state.filters.projects.difficulty = difficultyFilter?.value || '';
        this.state.filters.projects.matchingMode = matchingMode?.value || 'budget';

        if (this.elements.projectResultsGrid?.children.length > 0) {
            this.findProjects();
        }
    }

    handleProjectSort() {
        const resultsSort = document.getElementById('results-sort');
        this.state.filters.projects.sort = resultsSort?.value || 'match-score';

        if (this.elements.projectResultsGrid?.children.length > 0) {
            this.findProjects();
        }
    }

    // Form handlers
    handleComponentFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const customComponent = {
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            unit: formData.get('unit'),
            stockType: formData.get('stockType'),
            specifications: JSON.parse(formData.get('specifications') || '{}'),
            compatibleProjects: JSON.parse(formData.get('compatibleProjects') || '[]')
        };

        this.saveComponent(customComponent);
        this.closeAllModals();
    }

    handleProfileFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (this.state.currentUser) {
            this.state.currentUser.username = formData.get('username');
            this.state.currentUser.email = formData.get('email');

            localStorage.setItem('circuitfoundry_current_user', JSON.stringify(this.state.currentUser));

            this.showSuccess('Profile updated successfully');
        }
    }

    handlePreferencesFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (this.state.currentUser) {
            this.state.currentUser.preferences = {
                budget: parseFloat(formData.get('budget')),
                category: formData.get('category'),
                difficulty: formData.get('difficulty'),
                emailNotifications: formData.get('email-notifications') === 'on',
                savePreferences: formData.get('save-preferences') === 'on'
            };

            this.showSuccess('Preferences updated successfully');
        }
    }

    handleSecurityFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const currentPassword = formData.get('current-password');
        const newPassword = formData.get('new-password');
        const confirmNewPassword = formData.get('confirm-new-password');

        if (newPassword !== confirmNewPassword) {
            this.showError('New passwords do not match');
            return;
        }

        if (this.state.currentUser) {
            // Verify current password
            const verifyPassword = async (password) => {
                const passwordHash = await this.hashPassword(password);
                return passwordHash === this.state.currentUser.passwordHash;
            };

            if (!verifyPassword(currentPassword)) {
                this.showError('Current password is incorrect');
                return;
            }

            // Update password
            this.state.currentUser.passwordHash = await this.hashPassword(newPassword);

            const users = JSON.parse(localStorage.getItem('circuitfoundry_users') || '[]');
            const userIndex = users.findIndex(u => u.userId === this.state.currentUser.userId);
            if (userIndex !== -1) {
                users[userIndex] = this.state.currentUser;
                localStorage.setItem('circuitfoundry_users', JSON.stringify(users));
            }

            this.showSuccess('Password updated successfully');
            e.target.reset();
        }
    }

    handleDeleteAccountSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('confirm-username');
        const password = formData.get('confirm-password');
        const confirmDeletion = formData.get('confirm-deletion');

        if (!confirmDeletion) {
            this.showError('Please confirm that you understand the consequences');
            return;
        }

        if (username !== this.state.currentUser?.username) {
            this.showError('Username does not match');
            return;
        }

        // Verify password
        const verifyPassword = async (password) => {
            const passwordHash = await this.hashPassword(password);
            return passwordHash === this.state.currentUser.passwordHash;
        };

        if (!verifyPassword(password)) {
            this.showError('Password is incorrect');
            return;
        }

        // Delete user account
        const users = JSON.parse(localStorage.getItem('circuitfoundry_users') || '[]');
        const userIndex = users.findIndex(u => u.userId === this.state.currentUser.userId);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('circuitfoundry_users', JSON.stringify(users));
        }

        // Clear user data
        localStorage.removeItem('circuitfoundry_current_user');
        localStorage.removeItem(`circuitfoundry_inventory_${this.state.currentUser.userId}`);

        this.showSuccess('Account deleted successfully');
        this.logout();
    }

    handleImportFileSelect() {
        const fileInput = this.elements.importFile;
        const file = fileInput.files?.[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.inventory) {
                    this.state.inventory = data.inventory;
                }

                if (data.savedProjects) {
                    this.state.savedProjects = data.savedProjects;
                }

                if (data.preferences) {
                    this.state.preferences = data.preferences;
                }

                this.saveUserData();
                this.renderInventoryList(this.state.inventory);
                this.renderSavedProjects();

                this.showSuccess('Data imported successfully');
                this.closeImportModal();
            } catch (error) {
                this.showError('Failed to import data. Please check the file format.');
            }
        };

        reader.readAsText(file);
    }

    exportData() {
        const data = {
            inventory: this.state.inventory,
            savedProjects: this.state.savedProjects,
            preferences: this.state.preferences,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuitfoundry_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Data exported successfully');
    }

    exportAllData() {
        const allData = {
            users: JSON.parse(localStorage.getItem('circuitfoundry_users') || '[]'),
            components: this.state.components,
            projects: this.state.projects,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuitfoundry_all_data_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('All data exported successfully');
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.checkAuthState();
        this.initAnimations();
        this.loadComponents();
        this.loadProjects();
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new CircuitFoundryApp();
    });
} else {
    app = new CircuitFoundryApp();
}
