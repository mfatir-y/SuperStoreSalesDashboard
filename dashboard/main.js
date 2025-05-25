import { loadSuperstoreData } from './dataLoader.js';
import { filterData, calculateKPIs, updateKPIDisplay } from './dataFilter.js';
import { renderMap, renderSegmentChart, renderCategoryChart } from './charts.js';
import { showInsight, hideInsight } from './insightGenerator.js';

class SuperstoreDashboard {
    constructor() {
        this.data = [];
        this.filters = {
            dateRange: 'all',
            region: 'all',
            profitRatioMin: -100,
            profitRatioMax: 100
        };
        this.selectedContext = null;
        this.initializeEventListeners();
        this.loadData();
    }

    async loadData() {
        this.data = await loadSuperstoreData();
        console.log(`Loaded ${this.data.length} records`);
        this.renderDashboard();
    }

    initializeEventListeners() {
        const dateFilter = document.getElementById('date-filter');
        dateFilter.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.updateDashboard();
        });

        const regionFilter = document.getElementById('region-filter');
        regionFilter.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.updateDashboard();
        });

        const profitMinInput = document.getElementById('profit-ratio-min');
        profitMinInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.filters.profitRatioMin = val;
            document.getElementById('profit-min-val').textContent = val + '%';
            this.updateDashboard();
        });

        const profitMaxInput = document.getElementById('profit-ratio-max');
        profitMaxInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.filters.profitRatioMax = val;
            document.getElementById('profit-max-val').textContent = val + '%';
            this.updateDashboard();
        });
    }

    handleInsight = async (type, data) => {
        this.selectedContext = { type, data };
        const context = {
            filters: this.filters,
            kpis: calculateKPIs(filterData(this.data, this.filters))
        };
        await showInsight(type, data, context);
    }

    renderDashboard() {
        const filteredData = filterData(this.data, this.filters);
        const kpis = calculateKPIs(filteredData);
        updateKPIDisplay(kpis);
        
        renderMap(filteredData, this.handleInsight);
        renderSegmentChart(filteredData, this.handleInsight);
        renderCategoryChart(filteredData, this.handleInsight);
    }

    updateDashboard() {
        this.renderDashboard();
        hideInsight();
        this.selectedContext = null;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SuperstoreDashboard();
}); 