# Superstore Sales Dashboard

An interactive sales analytics dashboard with AI-powered insights for Superstore data visualization. The dashboard provides real-time analysis of sales performance across different states, segments, and categories, enhanced with AI-generated insights using Ollama.

This project is inspired by and uses data from the [Superstore Sales Dashboard](https://public.tableau.com/app/profile/technical.product.marketing/viz/SuperstoreSales_25/Overview) by Tableau, reimagined with modern web technologies and AI-powered insights.

## Dataset

The visualization uses the Superstore dataset, a standard dataset commonly used for business intelligence demonstrations. You can find the original dataset and visualization at:
- [Superstore Sales Dashboard on Tableau Public](https://public.tableau.com/app/profile/technical.product.marketing/viz/SuperstoreSales_25/Overview)

## Features

- 📊 Interactive US map visualization with state-wise profitability data
- 📈 Segment-wise sales trend analysis
- 🏷️ Category performance tracking
- 🤖 AI-powered insights using Ollama
- 🎨 Modern dark theme with interactive elements
- 📱 Responsive design with automatic resizing

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [Ollama](https://ollama.ai/) with the Mistral model

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SuperstoreSalesDashboard.git
cd SuperstoreSalesDashboard
```

2. Install dependencies:
```bash
npm install
```

3. Install and run Ollama:
```bash
# Install Ollama (instructions vary by OS)
# Visit https://ollama.ai/ for installation instructions

# Pull the Mistral model
ollama pull mistral
```

## Dependencies

The project uses the following key dependencies:
- [Vega-Lite](https://vega.github.io/vega-lite/) - For interactive visualizations
- [Vega-Embed](https://github.com/vega/vega-embed) - For embedding Vega visualizations
- Ollama with Mistral model - For AI-powered insights

## Usage

1. Start the Ollama service:
```bash
ollama serve
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Dashboard Features

### Filters
- Date Range Selection
- Region Filter
- Profit Ratio Range Slider

### Visualizations
1. **US Map**
   - Shows state-wise profitability
   - Color-coded based on profit ratio
   - Click on states for detailed insights

2. **Segment Analysis**
   - Consumer
   - Corporate
   - Home Office
   - Trend analysis with interactive points

3. **Category Performance**
   - Furniture
   - Office Supplies
   - Technology
   - Monthly trend visualization

### AI Insights
Click on any visualization element to get AI-powered insights that consider:
- Current selection context
- Applied filters
- Historical trends
- Performance metrics

## Project Structure

```
SuperstoreSalesDashboard/
├── dashboard/
│   ├── charts.js               # Visualization components
│   ├── dataLoader.js           # Data loading and processing
│   ├── dataFilter.js           # Data filtering utilities
│   ├── insightGenerator.js     # AI insight generation
│   └── main.js                 # Main application logic
├── data/   
│   └── us-10m.json             # US map topology data
├── index.html                  # Main HTML file
└── styles.css                  # Styling         
```

## Customization

### Modifying Visualizations
- Edit chart specifications in `charts.js`
- Adjust dimensions in `getChartDimensions()`
- Modify color schemes in chart configurations

### Customizing AI Insights
- Edit prompt templates in `insightGenerator.js`
- Adjust insight parameters in `generatePrompt()`
- Modify fallback insights in `generateInsight()`

## Troubleshooting

1. **Ollama Connection Issues**
   - Ensure Ollama is running (`ollama serve`)
   - Check if Mistral model is installed (`ollama list`)
   - Verify localhost:11434 is accessible

2. **Visualization Issues**
   - Check browser console for errors
   - Verify data format in `dataLoader.js`
   - Ensure proper filter configurations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 