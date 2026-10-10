import { GoogleGenAI } from '@google/genai';
import { FullWeatherData, AiBriefing } from '../types';

export async function generateWeatherBriefing(data: FullWeatherData): Promise<AiBriefing> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
    
    const contextPrompt = `
You are Aura, an elite chief meteorologist and lifestyle consultant.
Analyze these real-time weather conditions for ${data.location.name}, ${data.location.country}:
- Current: ${data.current.temperature}°C (Feels like ${data.current.apparentTemperature}°C), ${data.current.weatherText}
- Wind: ${data.current.windSpeed} km/h (Gusts: ${data.current.windGusts} km/h)
- Humidity: ${data.current.humidity}%, Cloud Cover: ${data.current.cloudCover}%, UV Index: ${data.current.uvIndex}
- Precipitation: ${data.current.precipitation} mm
- Air Quality (US AQI): ${data.airQuality?.usAqi ?? 'N/A'} (${data.airQuality?.qualityLabel ?? 'Good'})
- Today's Range: High ${data.daily[0]?.tempMax}°C, Low ${data.daily[0]?.tempMin}°C, Rain chance ${data.daily[0]?.precipitationProbability}%
- Upcoming 3-day trend: ${data.daily.slice(1, 4).map(d => `${d.dayOfWeek}: ${d.weatherText}, ${d.tempMax}°C/${d.tempMin}°C`).join('; ')}

Provide an intelligent concise response in JSON format with exactly these keys:
{
  "overview": "A punchy, engaging 2-sentence meteorological summary of the day's vibe and critical shifts to watch out for.",
  "outfitRecommendation": "Specific practical advice on layers, footwear, fabrics, or accessories (e.g. umbrella, sunglasses, windbreaker, scarf).",
  "activityAdvice": "Actionable advice for outdoor running, cycling, dining al fresco, gym or cozy indoor work.",
  "commuteStatus": "Clear commute forecast warning about rain slick roads, visibility, heat, or smooth conditions."
}
Do not use markdown wrappers if possible, return clean valid JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text ? response.text.trim() : '{}';
    const parsed = JSON.parse(jsonText);

    return {
      overview: parsed.overview || `Current weather in ${data.location.name} is ${data.current.weatherText.toLowerCase()} with a high of ${data.daily[0]?.tempMax}°C.`,
      outfitRecommendation: parsed.outfitRecommendation || `Wear comfortable layers suited for ${data.current.temperature}°C.`,
      activityAdvice: parsed.activityAdvice || 'Ideal conditions for your usual daily routine and moderate outdoor activities.',
      commuteStatus: parsed.commuteStatus || 'Road conditions and visibility appear favorable for travel.',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Gemini briefing generation fallback', err);
    return {
      overview: `Skies over ${data.location.name} are showing ${data.current.weatherText.toLowerCase()} conditions today, peaking around ${data.daily[0]?.tempMax ?? data.current.temperature}°C with ${data.current.humidity}% humidity.`,
      outfitRecommendation: data.current.temperature < 10 
        ? 'A warm insulated jacket, knit layer, and weather-resistant shoes are recommended.' 
        : data.current.precipitation > 0 
        ? 'Waterproof jacket or compact umbrella is essential today.' 
        : 'Light breathable attire with a light jacket for breezy moments.',
      activityAdvice: data.current.precipitation > 0.5 
        ? 'Wet surfaces present; indoor workouts or sheltered paths recommended.' 
        : 'Good conditions for outdoor strolls and jogging.',
      commuteStatus: 'Clear visibility with normal transit flow expected.',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export async function askAuraMeteorologist(question: string, data: FullWeatherData): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
    
    const prompt = `
You are "Aura", an intelligent, empathetic, and ultra-accurate meteorological AI assistant.
Current location: ${data.location.name}, ${data.location.country}
Current Weather: ${data.current.temperature}°C, ${data.current.weatherText}, Wind ${data.current.windSpeed} km/h, Humidity ${data.current.humidity}%, UV ${data.current.uvIndex}, Rain ${data.current.precipitation} mm.
Weekly forecast: ${data.daily.map(d => `${d.dayOfWeek}: ${d.weatherText}, High ${d.tempMax}°C Low ${d.tempMin}°C, Rain ${d.precipitationProbability}%`).join('; ')}.

User Question: "${question}"

Provide a friendly, direct, concise, and helpful answer (under 90 words). Use bullet points if listing specific days or gear.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text.trim() : 'I could not retrieve an answer right now. Please try again.';
  } catch (err) {
    console.error('Ask Aura error', err);
    return "I'm experiencing a momentary weather balloon disruption. Please try asking again in a moment!";
  }
}
