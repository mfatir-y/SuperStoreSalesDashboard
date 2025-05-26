export async function loadSuperstoreData() {
    try {
        const response = await fetch('data/sample_superstore.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        return parseCSVData(csvText);
    } catch (error) {
        console.error('Error loading CSV data:', error);
        document.querySelectorAll('.loading').forEach(el => {
            el.textContent = 'Error loading data. Please check console for details.';
        });
        return [];
    }
}

function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(",");

    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        const record = {};
        headers.forEach((header, index) => {
            record[header.replace(/"/g, '').trim()] = values[index] ? values[index].replace(/"/g, '').trim() : '';
        });

        // Calculate profit ratio (Profit / Sales * 100)
        const sales = parseFloat(record['Sales']) || 0;
        const profit = parseFloat(record['Profit']) || 0;
        let profitRatio = 0;
        if (sales !== 0) {
            profitRatio = (profit / sales) * 100;
        }

        return {
            date: new Date(record['Order Date']),
            segment: record['Segment'] || '',
            category: record['Category'] || '',
            region: record['Region'] || '',
            state: record['State'] || '',
            city: record['City'] || '',
            country: record['Country'] || '',
            sales: sales,
            profit: profit,
            profitRatio: profitRatio,
            discount: parseFloat(record['Discount']) || 0,
            quantity: parseInt(record['Quantity']) || 0
        };
    })
}
