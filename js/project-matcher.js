"use strict";

// Project matching module for CircuitFoundry
class ProjectMatcher {
    constructor() {
        this.projects = [];
        this.components = [];
        this.inventory = [];
    }

    // Initialize project matcher
    init(projects, components, inventory) {
        this.projects = projects;
        this.components = components;
        this.inventory = inventory;
    }

    // Match projects based on budget and inventory
    matchProjects(budget, inventory, filters = {}) {
        const {
            category = '',
            difficulty = '',
            matchingMode = 'budget'
        } = filters;

        return this.projects
            .filter(project => {
                // Apply category filter
                if (category && category !== '' && project.category !== category) {
                    return false;
                }

                // Apply difficulty filter
                if (difficulty && difficulty !== '' && project.difficulty !== difficulty) {
                    return false;
                }

                return true;
            })
            .map(project => this.calculateProjectMatch(project, budget, inventory))
            .sort((a, b) => this.sortProjects(a, b, matchingMode));
    }

    // Calculate project match score
    calculateProjectMatch(project, budget, inventory) {
        const components = this.components;
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
    }

    // Sort projects based on criteria
    sortProjects(a, b, sortBy) {
        switch (sortBy) {
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
    }

    // Get projects by category
    getProjectsByCategory(projects, category) {
        return projects.filter(p => p.category === category);
    }

    // Get projects by difficulty
    getProjectsByDifficulty(projects, difficulty) {
        return projects.filter(p => p.difficulty === difficulty);
    }

    // Filter projects based on search criteria
    filterProjects(projects, searchTerm) {
        if (!searchTerm) return projects;

        const search = searchTerm.toLowerCase();
        return projects.filter(project =>
            project.name.toLowerCase().includes(search) ||
            project.category.toLowerCase().includes(search) ||
            project.description.toLowerCase().includes(search)
        );
    }

    // Calculate budget match score
    calculateBudgetMatch(project, budget) {
        const additionalCost = project.additionalCost || 0;
        return additionalCost <= budget ? (budget - additionalCost) / Math.max(budget, 1) * 100 : 0;
    }

    // Get project by ID
    getProjectById(projects, id) {
        return projects.find(p => p.id === id);
    }

    // Create project from template
    createProjectTemplate(projectId) {
        const template = {
            id: projectId,
            name: `Project ${projectId}`,
            category: 'Other',
            difficulty: 'Beginner',
            description: 'A new electronics project.',
            estimatedBuildTime: '1-2 hours',
            budget: 100,
            components: [],
            instructions: [
                'Prepare required components.',
                'Build circuit on breadboard.',
                'Test connections before applying power.'
            ],
            learningOutcomes: [
                'Learn basic electronics principles.',
                'Practice circuit building skills.'
            ],
            safetyNotes: [
                'Use proper safety precautions.'
            ]
        };

        return template;
    }

    // Validate project data
    validateProject(project) {
        const errors = [];

        if (!project.id) {
            errors.push('Project ID is required');
        }

        if (!project.name) {
            errors.push('Project name is required');
        }

        if (!project.category) {
            errors.push('Project category is required');
        }

        if (!project.difficulty) {
            errors.push('Project difficulty is required');
        }

        if (!project.description) {
            errors.push('Project description is required');
        }

        if (!project.budget || project.budget < 0) {
            errors.push('Project budget must be a positive number');
        }

        if (!Array.isArray(project.components) || project.components.length === 0) {
            errors.push('Project must have at least one component');
        }

        // Validate each component
        project.components.forEach((comp, index) => {
            if (!comp.componentId) {
                errors.push(`Component ${index + 1}: Component ID is required`);
            }
            if (!comp.name) {
                errors.push(`Component ${index + 1}: Component name is required`);
            }
            if (!comp.quantity || comp.quantity < 1) {
                errors.push(`Component ${index + 1}: Quantity must be at least 1`);
            }
            if (!comp.unitPrice || comp.unitPrice < 0) {
                errors.push(`Component ${index + 1}: Unit price must be a positive number`);
            }
            if (!comp.totalPrice || comp.totalPrice < 0) {
                errors.push(`Component ${index + 1}: Total price must be a positive number`);
            }
        });

        return errors;
    }

    // Export project matcher data
    exportData() {
        return {
            projects: this.projects,
            components: this.components,
            inventory: this.inventory,
            lastUpdated: new Date().toISOString()
        };
    }

    // Import project matcher data
    importData(data) {
        if (data.projects) {
            this.projects = data.projects;
        }

        if (data.components) {
            this.components = data.components;
        }

        if (data.inventory) {
            this.inventory = data.inventory;
        }
    }

    // Get project statistics
    getProjectStats(projects) {
        return {
            total: projects.length,
            byCategory: this.getCategoryStats(projects),
            byDifficulty: this.getDifficultyStats(projects),
            averageBudget: this.getAverageBudget(projects),
            totalComponents: this.getTotalComponents(projects)
        };
    }

    // Get category statistics
    getCategoryStats(projects) {
        const stats = {};
        projects.forEach(project => {
            if (!stats[project.category]) {
                stats[project.category] = 0;
            }
            stats[project.category]++;
        });
        return stats;
    }

    // Get difficulty statistics
    getDifficultyStats(projects) {
        const stats = {};
        projects.forEach(project => {
            if (!stats[project.difficulty]) {
                stats[project.difficulty] = 0;
            }
            stats[project.difficulty]++;
        });
        return stats;
    }

    // Get average budget
    getAverageBudget(projects) {
        if (projects.length === 0) return 0;
        const total = projects.reduce((sum, project) => sum + project.budget, 0);
        return total / projects.length;
    }

    // Get total components
    getTotalComponents(projects) {
        return projects.reduce((sum, project) => sum + project.components.length, 0);
    }

    // Calculate project completion percentage
    calculateProjectCompletion(project, inventory) {
        const totalComponents = project.components.length;
        if (totalComponents === 0) return 100;

        let completedComponents = 0;

        project.components.forEach(reqComp => {
            const inventoryItem = inventory.find(inv => inv.componentId === reqComp.componentId);
            if (inventoryItem && inventoryItem.quantity >= reqComp.quantity) {
                completedComponents++;
            }
        });

        return (completedComponents / totalComponents) * 100;
    }
}

// Export the module
window.ProjectMatcher = ProjectMatcher;
