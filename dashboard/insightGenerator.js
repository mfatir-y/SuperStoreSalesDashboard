async function callOllama(prompt) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral',
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('There was an error calling Ollama:', error);
        return null;
    }
}

function generatePrompt(type, data, context) {
    let basePrompt = `You are a business analyst, provide a concise insight about the following data:\n\n`;
    if (type === 'location') {
        basePrompt += `State: ${data.state}
Region: ${data.region}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}
Profit Ratio: ${data.profitRatio.toFixed(1)}%

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- US Region: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this state's performance, considering:
1. The profit ratio in context of the national average
2. Any notable trends or patterns for this region
3. Potential factors affecting performance
4. Recommendations if performance is suboptimal

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
    } else if (type === 'segment') {
        basePrompt += `Segment: ${data.segment}
Time Period: ${data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- Region Filter: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this segment's performance, considering:
1. Historical performance trends
2. Comparison with other segments
3. Seasonal patterns if any
4. Growth opportunities

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
    } else if (type === 'category') {
    basePrompt += `Category: ${data.category}
Time Period: ${data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
Sales: $${data.sales.toLocaleString()}
Profit: $${data.profit.toLocaleString()}

Current Filters Applied By User:
${context.filters ? `- Date Range: ${context.filters.dateRange}
- Region Filter: ${context.filters.region}
- Profit Ratio Range: ${context.filters.profitRatioMin}% to ${context.filters.profitRatioMax}%` : 'No filters applied'}

Please analyze this category's performance, considering:
1. Market trends and demand patterns
2. Comparison with other categories
3. Seasonal influences
4. Optimization opportunities

Do not assume anything, just provide the facts.
Keep the response under 3 sentences, written in a paragraph format and focus on actionable insights.`;
    }

    return basePrompt;
}

export async function generateInsight(type, data, context) {
    const prompt = generatePrompt(type, data, context);
    const aiInsight = await callOllama(prompt);
    
    // Fallback to static insights if AI fails
    if (!aiInsight) {
        if (type === 'location') {
            const profitStatus = data.profitRatio > 0 ? 'profitable' : 'unprofitable';
            return `${data.state} shows ${Math.abs(data.profitRatio).toFixed(1)}% profit ratio with $${data.sales.toLocaleString()} in sales. This location is currently ${profitStatus}, ${data.profitRatio > 10 ? 'performing exceptionally well' : data.profitRatio < -10 ? 'requiring immediate attention' : 'showing moderate performance'}.`;
        } else if (type === 'segment') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            return `${data.segment} segment generated $${data.sales.toLocaleString()} in ${monthName}. ${data.segment === 'Consumer' ? 'Consumer segment typically shows steady growth with seasonal peaks.' : data.segment === 'Corporate' ? 'Corporate segment demonstrates consistent bulk purchasing patterns.' : 'Home Office segment reflects remote work trends and smaller order volumes.'}`;
        } else if (type === 'category') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            return `${data.category} category achieved $${data.sales.toLocaleString()} in sales during ${monthName}. ${data.category === 'Technology' ? 'Technology products typically have higher margins but seasonal demand patterns.' : data.category === 'Furniture' ? 'Furniture sales show longer purchase cycles with higher transaction values.' : 'Office Supplies demonstrate consistent demand with frequent reorders.'}`;
        }
    }
    return aiInsight;
}

export async function showInsight(type, data, context) {
    const insightPanel = document.getElementById('insight-panel');
    const insightText = document.getElementById('insight-text');
    
    // Show loading state
    insightText.textContent = 'Generating insight...';
    insightPanel.style.display = 'block';
    
    try {
        insightText.textContent = await generateInsight(type, data, context);
    } catch (error) {
        console.error('Error generating insight:', error);
        insightText.textContent = 'There was an error generating the insight. Please try again.';
    }
}

export function hideInsight() {
    document.getElementById('insight-panel').style.display = 'none';
} 