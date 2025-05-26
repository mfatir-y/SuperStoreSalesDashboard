import { createLocationPrompt, createSegmentPrompt, createCategoryPrompt } from './insightPrompts.js';

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
    switch (type) {
        case 'location':
            return createLocationPrompt(data, context);
        case 'segment':
            return createSegmentPrompt(data, context);
        case 'category':
            return createCategoryPrompt(data, context);
        default:
            throw new Error(`Unknown insight type: ${type}`);
    }
}

export async function generateInsight(type, data, context) {
    const prompt = generatePrompt(type, data, context);
    const aiInsight = await callOllama(prompt);
    
    // Fallback to static insights if AI fails
    if (!aiInsight) {
        if (type === 'location') {
            const profitStatus = data.profitRatio > 0 ? 'profitable' : 'unprofitable';
            return `${data.state} shows ${Math.abs(data.profitRatio).toFixed(1)}% profit ratio with 
            $${data.sales.toLocaleString()} in sales. This location is currently ${profitStatus}, 
            ${data.profitRatio > 10 ? 'performing exceptionally well' : data.profitRatio < -10 ? 
                'requiring immediate attention' : 'showing moderate performance'}.`;
        } else if (type === 'segment') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            return `${data.segment} segment generated $${data.sales.toLocaleString()} in ${monthName}. 
            ${data.segment === 'Consumer' ? 'Consumer segment typically shows steady growth with seasonal peaks.' : 
                data.segment === 'Corporate' ? 'Corporate segment demonstrates consistent bulk purchasing patterns.' : 
                    'Home Office segment reflects remote work trends and smaller order volumes.'}`;
        } else if (type === 'category') {
            const monthName = data.date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
            return `${data.category} category achieved $${data.sales.toLocaleString()} in sales during ${monthName}.
             ${data.category === 'Technology' ? 'Technology products typically have higher margins but seasonal ' +
                'demand patterns.' : data.category === 'Furniture' ? 'Furniture sales show longer purchase cycles ' +
                'with higher transaction values.' : 'Office Supplies demonstrate consistent demand with frequent ' +
                'reorders.'}`;
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