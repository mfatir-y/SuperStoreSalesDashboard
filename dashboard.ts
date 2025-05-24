/// <reference lib="es2017" />

// @ts-ignore
import embed, { VisualizationSpec } from 'vega-embed';

interface RawSuperstore {
    'Order Date': string;
    Segment: string;
    Category: string;
    Region: string;
    State: string;
    Sales: string;
    Profit: string;
    'Profit Ratio': string;
    Discount: string;
    Latitude: string;
    Longitude: string;
}

interface SuperstoreRecord {
    date: Date;
    segment: string;
    category: string;
    region: string;
    state: string;
    sales: number;
    profit: number;
    profitRatio: number;
    discount: number;
    latitude: number;
    longitude: number;
}

// TypeScript-style class for dashboard functionality
class SuperstoreDashboard {
    private data: SuperstoreRecord[];
    private filters: { dateRange: string; market: string; profitRatioMin: number; profitRatioMax: number };
    private selectedContext: { type: string; data: any } | null;

    constructor() {
        this.data = [];
        this.filters = {
            dateRange: 'last-3-years',
            market: 'all',
            profitRatioMin: -169,
            profitRatioMax: 44
        };
        this.selectedContext = null;
        this.initializeEventListeners();
        this.loadData();
    }

    private loadData() {
    fetch('data/sample_superstore.csv')
        .then(res => res.text())
        .then(text => {
            const [headerLine, ...lines] = text.trim().split('\n');
            const headers = headerLine.split(',');
            const raw = lines.map(line => {
                const cols = line.split(',');
                const obj: any = {};
                headers.forEach((h, i) => obj[h] = cols[i]);
                return obj as RawSuperstore;
        });
        this.data = raw.map(d => ({
            date: new Date(d['Order Date']),
            segment: d.Segment,
            category: d.Category,
            region: d.Region,
            state: d.State,
            sales: +d.Sales,
            profit: +d.Profit,
            profitRatio: +d['Profit Ratio'],
            discount: +d.Discount,
            latitude: +d.Latitude,
            longitude: +d.Longitude
        }));
        this.renderDashboard();
      })
      .catch(error => console.error('Error loading CSV data:', error));
    }

    initializeEventListeners() {
        const dateFilter = document.getElementById('date-filter') as HTMLSelectElement;
        dateFilter.addEventListener('change', (e) => {
          this.filters.dateRange = (e.target as HTMLSelectElement).value;
          this.updateDashboard();
        });

        const marketFilter = document.getElementById('market-filter') as HTMLSelectElement;
        marketFilter.addEventListener('change', (e) => {
          this.filters.market = (e.target as HTMLSelectElement).value;
          this.updateDashboard();
        });

        const profitMinInput = document.getElementById('profit-ratio-min') as HTMLInputElement;
        profitMinInput.addEventListener('input', (e) => {
          const val = parseInt((e.target as HTMLInputElement).value, 10);
          this.filters.profitRatioMin = val;
          document.getElementById('profit-min-val')!.textContent = val + '%';
          this.updateDashboard();
        });

        const profitMaxInput = document.getElementById('profit-ratio-max') as HTMLInputElement;
        profitMaxInput.addEventListener('input', (e) => {
          const val = parseInt((e.target as HTMLInputElement).value, 10);
          this.filters.profitRatioMax = val;
          document.getElementById('profit-max-val')!.textContent = val + '%';
          this.updateDashboard();
        });
    }

    filterData(data: SuperstoreRecord[]) {
        return data.filter((d: { date: { getFullYear: () => any; }; region: string; profitRatio: number; }) => {
            if (this.filters.dateRange !== 'all') {
                const year = d.date.getFullYear();
                if (this.filters.dateRange === 'last-3-years') {
                    if (year < new Date().getFullYear() - 3) return false;
                } else if (this.filters.dateRange !== year.toString()) {
                    return false;
                }
            }
            if (this.filters.market !== 'all' && d.region !== this.filters.market) {
                return false;
            }
            return !(d.profitRatio < this.filters.profitRatioMin || d.profitRatio > this.filters.profitRatioMax);
        });
    }

    updateKPIs(filteredData: SuperstoreRecord[]) {
        const totalSales = filteredData.reduce((sum, d) => sum + d.sales, 0);
        const totalProfit = filteredData.reduce((sum, d) => sum + d.profit, 0);
        const avgDiscount = filteredData.reduce((sum, d) => sum + d.discount, 0) / filteredData.length;
        const profitRatio = (totalProfit / totalSales) * 100;
        const uniqueOrders = new Set(filteredData.map(d => d.date.toDateString())).size;
        const uniqueCustomers = Math.floor(filteredData.length / 3); // Approximate

        document.getElementById('kpi-sales').textContent = '$' + totalSales.toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('kpi-profit').textContent = '$' + totalProfit.toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('kpi-profit-ratio').textContent = profitRatio.toFixed(0) + '%';
        document.getElementById('kpi-profit-order').textContent = '$' + (totalProfit / uniqueOrders).toFixed(2);
        document.getElementById('kpi-profit-customer').textContent = '$' + (totalProfit / uniqueCustomers).toFixed(2);
        document.getElementById('kpi-discount').textContent = (avgDiscount * 100).toFixed(0) + '%';
    }

    renderMap(data) {
        const mapSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 600,
            "height": 350,
            "projection": {"type": "naturalEarth1"},
            "layer": [
                {
                    "data": {
                        "url": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
                        "format": {"type": "topojson", "feature": "countries"}
                    },
                    "mark": {
                        "type": "geoshape",
                        "fill": "#e8e8e8",
                        "stroke": "#ffffff",
                        "strokeWidth": 0.5
                    }
                },
                {
                    "data": {"values": data},
                    "mark": {
                        "type": "circle",
                        "opacity": 0.8,
                        "stroke": "#fff",
                        "strokeWidth": 1
                    },
                    "encoding": {
                        "longitude": {"field": "longitude", "type": "quantitative"},
                        "latitude": {"field": "latitude", "type": "quantitative"},
                        "size": {
                            "field": "sales",
                            "type": "quantitative",
                            "scale": {"range": [50, 1000]},
                            "legend": null
                        },
                        "color": {
                            "field": "profitRatio",
                            "type": "quantitative",
                            "scale": {
                                "domain": [-50, 0, 50],
                                "range": ["#ff6b6b", "#ffffff", "#45b7d1"]
                            },
                            "legend": null
                        },
                        "tooltip": [
                            {"field": "state", "type": "nominal", "title": "State"},
                            {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"},
                            {"field": "profit", "type": "quantitative", "title": "Profit", "format": "$,.0f"},
                            {"field": "profitRatio", "type": "quantitative", "title": "Profit Ratio", "format": ".1f"}
                        ]
                    }
                }
            ]
        };

        embed('#map-chart', mapSpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    this.selectedContext = {
                        type: 'location',
                        data: item.datum
                    };
                    this.showInsight();
                }
            });
        });
    }

    renderSegmentChart(data) {
        const monthlyData = this.aggregateByMonth(data, 'segment');

        const segmentSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 400,
            "height": 200,
            "data": {"values": monthlyData},
            "mark": {"type": "area", "opacity": 0.8},
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "title": "Date",
                    "axis": {"format": "%m/%Y"}
                },
                "y": {
                    "field": "sales",
                    "type": "quantitative",
                    "title": "Sales",
                    "axis": {"format": "$,.0f"}
                },
                "color": {
                    "field": "segment",
                    "type": "nominal",
                    "scale": {
                        "domain": ["Consumer", "Corporate", "Home Office"],
                        "range": ["#4e79a7", "#f28e2c", "#e15759"]
                    },
                    "legend": {"title": "Segment"}
                },
                "tooltip": [
                    {"field": "date", "type": "temporal", "title": "Date"},
                    {"field": "segment", "type": "nominal", "title": "Segment"},
                    {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"}
                ]
            }
        };

        embed('#segment-chart', segmentSpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    this.selectedContext = {
                        type: 'segment',
                        data: item.datum
                    };
                    this.showInsight();
                }
            });
        });
    }

    renderCategoryChart(data) {
        const monthlyData = this.aggregateByMonth(data, 'category');

        const categorySpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 400,
            "height": 200,
            "data": {"values": monthlyData},
            "mark": {"type": "area", "opacity": 0.8},
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "title": "Date",
                    "axis": {"format": "%m/%Y"}
                },
                "y": {
                    "field": "sales",
                    "type": "quantitative",
                    "title": "Sales",
                    "axis": {"format": "$,.0f"}
                },
                "color": {
                    "field": "category",
                    "type": "nominal",
                    "scale": {
                        "domain": ["Furniture", "Office Supplies", "Technology"],
                        "range": ["#76b900", "#ff9500", "#0084ff"]
                    },
                    "legend": {"title": "Category"}
                },
                "tooltip": [
                    {"field": "date", "type": "temporal", "title": "Date"},
                    {"field": "category", "type": "nominal", "title": "Category"},
                    {"field": "sales", "type": "quantitative", "title": "Sales", "format": "$,.0f"}
                ]
            }
        };

        embed('#category-chart', categorySpec, {actions: false}).then(result => {
            result.view.addEventListener('click', (event, item) => {
                if (item && item.datum) {
                    this.selectedContext = {
                        type: 'category',
                        data: item.datum
                    };
                    this.showInsight();
                }
            });
        });
    }

    private aggregateByMonth(data: SuperstoreRecord[], groupBy: 'segment' | 'category'):
        Array<Record<string, any> & { date: Date; sales: number; profit: number; count: number }> {
        interface Agg {
            date: string;
            [key: string]: any;
            sales: number;
            profit: number;
            count: number;
        }
        const grouped: Record<string, Agg> = {};

        data.forEach(d => {
        const monthKey = d.date.getFullYear() + '-' + String(d.date.getMonth() + 1).padStart(2, '0');
        const key = `${monthKey}_${d[groupBy]}`;
        if (!grouped[key]) {
            grouped[key] = {
                date: monthKey + '-01',
                [groupBy]: d[groupBy],
                sales: 0,
                profit: 0,
                count: 0,
            };
        }
        grouped[key].sales += d.sales;
        grouped[key].profit += d.profit;
        grouped[key].count += 1;
        });

        return Object.values(grouped).map((o: Agg) => ({
            ...o,
            date: new Date(o.date),
        }));
    }

    showInsight() {
        if (!this.selectedContext) return;

        const { type, data } = this.selectedContext;
        let insightText = '';

        if (type === 'location') {
            const profitStatus = data.profitRatio > 0 ? 'profitable' : 'unprofitable';
            insightText = `Location Analysis: ${data.state} shows ${Math.abs(data.profitRatio).toFixed(1)}% profit ratio with $${data.sales.toLocaleString()} in sales. This location is currently ${profitStatus}, ${data.profitRatio > 10 ? 'performing exceptionally well' : data.profitRatio < -10 ? 'requiring immediate attention' : 'showing moderate performance'}.`;
        } else if (type === 'segment') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            insightText = `Segment Trends: ${data.segment} segment generated $${data.sales.toLocaleString()} in ${monthName}. ${data.segment === 'Consumer' ? 'Consumer segment typically shows steady growth with seasonal peaks.' : data.segment === 'Corporate' ? 'Corporate segment demonstrates consistent bulk purchasing patterns.' : 'Home Office segment reflects remote work trends and smaller order volumes.'}`;
        } else if (type === 'category') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            insightText = `Category Performance: ${data.category} category achieved $${data.sales.toLocaleString()} in sales during ${monthName}. ${data.category === 'Technology' ? 'Technology products typically have higher margins but seasonal demand patterns.' : data.category === 'Furniture' ? 'Furniture sales show longer purchase cycles with higher transaction values.' : 'Office Supplies demonstrate consistent demand with frequent reorders.'}`;
        }

        document.getElementById('insight-text').textContent = insightText;
        document.getElementById('insight-panel').style.display = 'block';
    }

    renderDashboard() {
        const filteredData = this.filterData(this.data);
        this.updateKPIs(filteredData);
        this.renderMap(filteredData);
        this.renderSegmentChart(filteredData);
        this.renderCategoryChart(filteredData);
    }

    updateDashboard() {
        this.renderDashboard();
        // Hide insight panel when filters change
        document.getElementById('insight-panel').style.display = 'none';
        this.selectedContext = null;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {new SuperstoreDashboard()});