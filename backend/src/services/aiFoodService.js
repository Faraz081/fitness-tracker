import { GEMINI_API_KEY } from '../config/index.js';
import { AppError } from '../utils/apiError.js';
import { nutritionAnalyzeResultSchema } from '../utils/validators.js';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TIMEOUT_MS = 10_000;

const unavailable = () => new AppError(502, 'AI analysis is temporarily unavailable. Please try again.', 'AI_UNAVAILABLE');
const notFood = () => new AppError(422, 'Food could not be identified. Please try another search.', 'AI_NOT_FOOD');

function buildPrompt({ query, quantity, unit }) {
    const serving = quantity !== undefined
        ? `${quantity}${unit ? ` ${unit}` : ''} (the serving supplied by the user)`
        : 'one sensible standard serving for the described food/drink';
    return [
        'You are a nutrition analysis assistant. Analyse the food or drink described by the user.',
        'Respond with STRICT JSON only (no markdown, no prose) using exactly this shape:',
        '{"foodName": string, "quantity": number, "unit": string, "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number, "sodium": number}',
        `Scale every nutrition value to ${serving}.`,
        'calories is in kcal (0-2000). protein, carbs and fat are in grams (0-500).',
        'quantity must be greater than 0 and at most 1000.',
        'If you choose the standard serving yourself, express it IN GRAMS: quantity is the gram weight and unit is "g" (e.g. quantity: 200, unit: "g" for a 200g serving).',
        'fiber, sugar and sodium are optional, in grams (0-500): include them ONLY when you are confident of the value, otherwise omit the field entirely — never invent or guess these values.',
        'If the description is not a food or drink, respond with {"foodName": null}.',
        `User description: ${query}`,
    ].join('\n');
}

function parseModelJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            }
            catch {
                return null;
            }
        }
        return null;
    }
}

function normalizeUnit(value) {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
}

export async function analyzeFood({ query, quantity, unit }) {
    if (!GEMINI_API_KEY) {
        throw new AppError(503, 'AI analysis is not configured. Contact the administrator.', 'AI_UNCONFIGURED');
    }
    const prompt = buildPrompt({ query, quantity, unit });
    let response;
    try {
        response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                    maxOutputTokens: 2048,
                },
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    }
    catch {
        throw unavailable();
    }
    if (!response.ok) {
        throw unavailable();
    }
    let payload;
    try {
        payload = await response.json();
    }
    catch {
        throw unavailable();
    }
    const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof raw !== 'string' || raw.trim() === '') {
        throw unavailable();
    }
    const parsed = parseModelJson(raw);
    if (!parsed || typeof parsed !== 'object') {
        throw unavailable();
    }
    if (parsed.foodName === null || parsed.foodName === undefined || String(parsed.foodName).trim() === '') {
        throw notFood();
    }
    const result = nutritionAnalyzeResultSchema.safeParse({
        foodName: parsed.foodName,
        quantity: quantity ?? parsed.quantity,
        unit: unit ?? normalizeUnit(parsed.unit),
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fat: parsed.fat,
        fiber: parsed.fiber,
        sugar: parsed.sugar,
        sodium: parsed.sodium,
    });
    if (!result.success) {
        throw unavailable();
    }
    return result.data;
}
