"use strict";

// Component management module for CircuitFoundry
class ComponentsModule {
    constructor() {
        this.components = [];
        this.categories = [];
    }

    // Initialize components module
    init() {
        this.loadComponents();
        this.updateCategories();
    }

    // Load components from storage
    loadComponents() {
        // Try to load from localStorage first
        let storedComponents = localStorage.getItem('circuitfoundry_components');
        
        if (storedComponents) {
            try {
                this.components = JSON.parse(storedComponents);
            } catch (error) {
                console.error('Error parsing stored components:', error);
                this.components = [];
            }
        }

        // If no components stored, load default components
        if (this.components.length === 0) {
            this.loadDefaultComponents();
        }

        // Save to localStorage
        this.saveComponents();
    }

    // Load default components from database
    loadDefaultComponents() {
        // Load from projects.json
        fetch('database/projects.json')
            .then(response => response.json())
            .then(projects => {
                // Create basic components from projects
                this.components = projects.flatMap(project => 
                    project.components.map(comp => ({
                        id: comp.componentId,
                        name: comp.name,
                        category: this.getComponentCategory(comp.name),
                        description: this.getComponentDescription(comp.name, project.name),
                        price: comp.unitPrice,
                        unit: 'piece',
                        stockType: 'individual',
                        specifications: this.getComponentSpecs(comp.componentId),
                        compatibleProjects: [project.id]
                    }))
                );

                // Add some default components
                this.addDefaultComponents();
                
                // Save to storage
                this.saveComponents();
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                this.components = this.getFallbackComponents();
                this.saveComponents();
            });
    }

    // Add default components
    addDefaultComponents() {
        const defaultComponents = [
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
            },
            {
                id: 'COMP004',
                name: 'Ne555 Timer IC',
                category: 'Integrated Circuits',
                description: 'Versatile timer IC for pulse generation and timing applications.',
                price: 5,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    type: 'Timer',
                    operatingVoltage: '4.5-16 V'
                },
                compatibleProjects: ['PROJECT002', 'PROJECT008']
            },
            {
                id: 'COMP005',
                name: 'Arduino Uno',
                category: 'Development Boards',
                description: 'Popular Arduino-compatible development board for beginners.',
                price: 25,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    processor: 'ATmega328P',
                    voltage: '5 V',
                    flashMemory: '32 KB'
                },
                compatibleProjects: ['PROJECT001', 'PROJECT002', 'PROJECT003', 'PROJECT004', 'PROJECT005', 'PROJECT006', 'PROJECT007', 'PROJECT008', 'PROJECT009', 'PROJECT010', 'PROJECT011']
            },
            {
                id: 'COMP006',
                name: 'ESP32 Development Board',
                category: 'Development Boards',
                description: 'WiFi and Bluetooth enabled microcontroller for IoT projects.',
                price: 35,
                unit: 'piece',
                stockType: 'individual',
                specifications: {
                    processor: 'ESP32',
                    wifi: '802.11 b/g/n',
                    bluetooth: 'BT4.0'
                },
                compatibleProjects: ['PROJECT001', 'PROJECT002', 'PROJECT003', 'PROJECT004', 'PROJECT005', 'PROJECT006', 'PROJECT007', 'PROJECT008', 'PROJECT009', 'PROJECT010', 'PROJECT011']
            }
        ];

        // Add default components if none exist
        if (this.components.length === 0) {
            this.components = defaultComponents;
        } else {
            // Add missing default components
            defaultComponents.forEach(defaultComp => {
                if (!this.components.find(c => c.id === defaultComp.id)) {
                    this.components.push(defaultComp);
                }
            });
        }
    }

    // Get fallback components
    getFallbackComponents() {
        return [
            {
                id: 'COMP001',
                name: 'Resistor 220 Ohm',
                category: 'Resistors',
                description: '220-ohm resistor for current limiting and basic circuits.',
                price: 2,
                unit: 'piece',
                stockType: 'individual',
                specifications: { resistance: '220 ohm', power: '0.25 W' },
                compatibleProjects: ['PROJECT001', 'PROJECT003', 'PROJECT006']
            },
            {
                id: 'COMP002',
                name: 'Capacitor 10uF',
                category: 'Capacitors',
                description: '10-microfarad capacitor for power supply filtering.',
                price: 4,
                unit: 'piece',
                stockType: 'individual',
                specifications: { capacitance: '10 uF', voltage: '25 V' },
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
                specifications: { wavelength: 'Red', forwardVoltage: '2.0 V' },
                compatibleProjects: ['PROJECT001', 'PROJECT002', 'PROJECT009', 'PROJECT012']
            }
        ];
    }

    // Get component category based on name
    getComponentCategory(name) {
        const categoryMap = {
            'Resistor': 'Resistors',
            'Capacitor': 'Capacitors',
            'LED': 'LEDs',
            'Diode': 'Diodes',
            'Transistor': 'Transistors',
            'Timer': 'Integrated Circuits',
            'Op-Amp': 'Integrated Circuits',
            'LED': 'LEDs',
            'Sensor': 'Sensors',
            'Arduino': 'Development Boards',
            'ESP32': 'Development Boards',
            'Raspberry': 'Development Boards',
            'Motor': 'Motors',
            'Buzzer': 'Buzzers',
            'Switch': 'Switches',
            'Potentiometer': 'Switches',
            'Display': 'Displays',
            'LCD': 'Displays',
            'OLED': 'Displays',
            '7-Segment': 'Displays'
        };

        // Find matching category
        for (const [key, category] of Object.entries(categoryMap)) {
            if (name.toLowerCase().includes(key.toLowerCase())) {
                return category;
            }
        }

        return 'Other';
    }

    // Get component description
    getComponentDescription(name, projectName) {
        return `${name} for ${projectName} project.`;
    }

    // Get component specifications
    getComponentSpecs(componentId) {
        // Return basic specs based on component ID
        const specs = {
            'COMP001': { resistance: '220 ohm', power: '0.25 W' },
            'COMP002': { capacitance: '10 uF', voltage: '25 V' },
            'COMP003': { wavelength: 'Red', forwardVoltage: '2.0 V' },
            'COMP018': { type: 'Timer', operatingVoltage: '4.5-16 V' },
            'COMP023': { processor: 'ATmega328P', voltage: '5 V', flashMemory: '32 KB' },
            'COMP024': { processor: 'ESP32', wifi: '802.11 b/g/n', bluetooth: 'BT4.0' }
        };

        return specs[componentId] || {};
    }

    // Update categories list
    updateCategories() {
        const uniqueCategories = [...new Set(this.components.map(c => c.category))];
        this.categories = uniqueCategories.sort();
    }

    // Get all components
    getComponents() {
        return this.components;
    }

    // Get component by ID
    getComponent(id) {
        return this.components.find(c => c.id === id);
    }

    // Add component
    addComponent(component) {
        this.components.push(component);
        this.saveComponents();
        this.updateCategories();
    }

    // Update component
    updateComponent(id, updates) {
        const index = this.components.findIndex(c => c.id === id);
        if (index !== -1) {
            this.components[index] = { ...this.components[index], ...updates };
            this.saveComponents();
        }
    }

    // Remove component
    removeComponent(id) {
        this.components = this.components.filter(c => c.id !== id);
        this.saveComponents();
    }

    // Search components
    searchComponents(query) {
        const searchTerm = query.toLowerCase();
        return this.components.filter(component =>
            component.name.toLowerCase().includes(searchTerm) ||
            component.category.toLowerCase().includes(searchTerm) ||
            component.description.toLowerCase().includes(searchTerm)
        );
    }

    // Filter components by category
    filterComponentsByCategory(category) {
        if (!category) return this.components;
        return this.components.filter(c => c.category === category);
    }

    // Sort components
    sortComponents(field, direction = 'asc') {
        return this.components.sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Get categories
    getCategories() {
        return this.categories;
    }

    // Save components to storage
    saveComponents() {
        localStorage.setItem('circuitfoundry_components', JSON.stringify(this.components));
    }

    // Get components by category
    getComponentsByCategory(category) {
        return this.components.filter(c => c.category === category);
    }

    // Get component count
    getComponentCount() {
        return this.components.length;
    }

    // Initialize with default data if empty
    ensureDefaultData() {
        if (this.components.length === 0) {
            this.loadDefaultComponents();
        }
    }
}

// Export the module
window.ComponentsModule = ComponentsModule;
