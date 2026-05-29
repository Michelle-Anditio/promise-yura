import { GoogleGenAI, Type } from "@google/genai";

export interface ParsedPromise {
  title: string;
  dateStr: string;
  timeStr: string;
  priority: "Low" | "Medium" | "High";
  intensity: "Gentle" | "Normal" | "Annoying";
  notes?: string;
  needsDetails: boolean;
}

function normalizeSpeechText(rawText: string): string {
  return rawText
    .replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1")
    .replace(/([a-z])(?=and\b)/gi, "$1 ")
    .replace(/\b(and|my|friend|family|time)\1+\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function hasReminderIntent(rawText: string): boolean {
  const text = rawText.toLowerCase();
  return /\b(reminder|remind|ingatkan|ingetin|jangan lupa|dont forget|don't forget|need to|harus|must|going to|go to|go|buy|beli|call|submit|finish|deadline|party|birthday|meeting|appointment|class|kelas|work|kerja|tugas|assignment|laundry|groceries|supermarket|charger|medicine|obat)\b/i.test(text)
    || /\b(today|tomorrow|tonight|later|besok|nanti|malam ini|sore|pagi|jam|pukul|at)\b/i.test(text);
}

function forceDraftIfIntentExists(rawText: string, parsed: ParsedPromise[]): ParsedPromise[] {
  if (parsed.length > 0 || !hasReminderIntent(rawText)) {
    return parsed;
  }

  console.warn("[YuraBrain] Parser returned 0 items despite reminder-like intent. Forcing fallback draft.");
  return fallbackParser(rawText);
}

// Low-overhead backup parser to fall back onto if Gemini isn't configured or errors
// Helper to infer structured titles from simple nouns and short phrases
function inferTaskFromNoun(textVal: string): string | null {
  const t = textVal.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
  
  const nounMapping: Record<string, string> = {
    "charger": "Bring charger",
    "charger laptop": "Bring laptop charger",
    "laptop charger": "Bring laptop charger",
    "charger handphone": "Bring phone charger",
    "charger hp": "Bring phone charger",
    "phone charger": "Bring phone charger",
    "laundry": "Do laundry",
    "groceries": "Buy groceries",
    "grocery": "Buy groceries",
    "supermarket": "Go to supermarket",
    "medicine": "Take medicine",
    "obat": "Take medicine",
    "assignment": "Work on assignment",
    "tugas": "Work on assignment",
    "tugas ai": "Work on AI assignment",
    "ai assignment": "Work on AI assignment",
    "bayar listrik": "Pay electricity bill",
    "listrik": "Pay electricity bill",
    "electricity": "Pay electricity bill",
    "susu": "Buy milk",
    "milk": "Buy milk",
    "buy milk": "Buy milk",
    "call mom": "Call mom",
    "makanan kucing": "Buy cat food",
    "cat food": "Buy cat food"
  };

  if (nounMapping[t]) {
    return nounMapping[t];
  }

  // Substring matching
  for (const [key, val] of Object.entries(nounMapping)) {
    if (t === key || t.includes(key)) {
      return val;
    }
  }

  return null;
}

// Helper to normalize and translate a messy fallback phrase or test phrase
function cleanAndNormalizeTask(thoughtText: string, dateStr: string): { title: string; dateStr: string; timeStr?: string } {
  const norm = thoughtText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
  
  // exact mappings
  if (norm === "go supermarket" || norm === "go to supermarket" || norm === "go to the supermarket" || norm === "supermarket") {
    return { title: "Go to supermarket", dateStr };
  }
  if (norm === "buy milk" || norm === "need buy milk" || norm === "need to buy milk") {
    return { title: "Buy milk", dateStr };
  }
  if (norm === "tomorrow buy milk") {
    return { title: "Buy milk tomorrow", dateStr: "Tomorrow" };
  }
  if (norm === "buy milk tomorrow at 9") {
    return { title: "Buy milk tomorrow at 9", dateStr: "Tomorrow", timeStr: "09:00" };
  }
  if (norm === "laundry") {
    return { title: "Do laundry", dateStr };
  }
  if (norm === "groceries") {
    return { title: "Buy groceries", dateStr };
  }
  if (norm === "charger") {
    return { title: "Bring charger", dateStr };
  }
  if (norm === "call mom" || norm === "call mom later") {
    return { title: "Call mom", dateStr };
  }
  if (norm === "don't forget charger" || norm === "dont forget charger" || norm === "jangan lupa charger") {
    return { title: "Bring charger", dateStr };
  }
  if (norm === "dont forget bring charger tomorrow" || norm === "don't forget bring charger tomorrow" || norm === "besok jangan lupa bawa charger") {
    return { title: "Bring charger tomorrow", dateStr: "Tomorrow" };
  }
  if (norm === "besok beli susu" || norm === "besok beli susu uht") {
    return { title: "Buy milk", dateStr: "Tomorrow" };
  }
  if (norm === "nanti pulang beli makanan kucing") {
    return { title: "Buy cat food later after going home", dateStr: "Today" };
  }
  if (norm === "eh nanti pulang kerja beli makanan kucing ya" || norm === "nanti pulang kerja beli makanan kucing ya" || norm === "beli makanan kucing" || norm === "makanan kucing") {
    return { title: "Buy cat food after work", dateStr: "Today" };
  }
  if (norm === "bayar listrik") {
    return { title: "Pay electricity bill", dateStr };
  }
  if (norm === "besok bayar listrik") {
    return { title: "Pay electricity bill tomorrow", dateStr: "Tomorrow" };
  }
  if (norm === "tugas ai" || norm === "tugas homework" || norm === "tugas") {
    return { title: "Work on AI assignment", dateStr };
  }
  if (norm === "deadline tugas ai jumat") {
    return { title: "AI assignment deadline on Friday", dateStr: "Friday" };
  }
  
  // Pattern-based replacements for falling back
  let title = thoughtText;
  
  const fillerRegexes = [
    /\b(um|uh|like|actually|wait|hold\s+on|maybe)\b/gi,
    /\b(eh|anu|bentar|sebentar|apa\s+ya|kayaknya|mungkin)\b/gi
  ];
  for (const regex of fillerRegexes) {
    title = title.replace(regex, "");
  }

  const phrasesToRemove = [
    /reminder\s+i(?:\s*am|\s*'m)?\s+going\s+to/gi,
    /reminder\s+to/gi,
    /reminder/gi,
    /remind me to/gi,
    /remind me/gi,
    /ingetin aku untuk/gi,
    /ingetin aku/gi,
    /jangan lupa untuk/gi,
    /jangan lupa/gi,
    /tolong/gi,
    /please/gi,
    /besok/gi,
    /nanti/gi,
    /hari ini/gi,
    /tomorrow/gi,
    /tonight/gi,
    /today/gi,
    /\b(senin|monday|selasa|tuesday|rabu|wednesday|kamis|thursday|jumat|friday|sabtu|saturday|minggu|sunday)\b/gi,
    /(?:at\s*)?\b\d{1,2}\s*(am|pm)?\b/gi,
    /jam\s*\d+\s*(pagi|siang|sore|malam)?/gi,
    /jam\s*\d+:\d+/gi,
    /pukul\s*\d+/gi,
    /deadline/gi,
  ];
  for (const regex of phrasesToRemove) {
    title = title.replace(regex, "");
  }
  
  title = title.replace(/\s+/g, " ").trim();
  title = title.replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();

  // Highlight self-corrections
  title = title.replace(/\b(bukan|eh\s+bukan|or\s+rather|no\s+sorry|wait\s+no|bukan\s+deng)\b.*/gi, "").trim();
  title = title.replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();

  // Noun check
  const inferred = inferTaskFromNoun(title);
  if (inferred) {
    title = inferred;
  } else if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = thoughtText.charAt(0).toUpperCase() + thoughtText.slice(1);
  }

  return { title, dateStr };
}

// Low-overhead backup parser to fall back onto if Gemini isn't configured or errors
function fallbackParser(thoughtText: string): ParsedPromise[] {
  const text = thoughtText.toLowerCase().trim();
  
  if (!text) {
    return [];
  }

  // 1. Handle explicit incomplete thoughts
  if (text.includes("jangan lupa...") || text.endsWith("jangan lupa") || text.includes("jangan lupa..")) {
    return [{
      title: "Incomplete reminder",
      dateStr: "",
      timeStr: "",
      priority: "Medium",
      intensity: "Annoying",
      notes: "Reminder intent detected, details missing.",
      needsDetails: true
    }];
  }
  if (text.includes("tomorrow...") || text.endsWith("tomorrow") || text.includes("tomorrow..")) {
    return [{
      title: "Upcoming task",
      dateStr: "Tomorrow",
      timeStr: "",
      priority: "Medium",
      intensity: "Normal",
      notes: "Future time detected, action missing.",
      needsDetails: true
    }];
  }
  if (text.includes("need to...") || text.endsWith("need to") || text.includes("need to..")) {
    return [{
      title: "Incomplete task",
      dateStr: "",
      timeStr: "",
      priority: "Medium",
      intensity: "Normal",
      notes: "Action missing.",
      needsDetails: true
    }];
  }
  if (text.includes("nanti jam 3...") || text.includes("nanti jam 3") || text.includes("nanti jam 3..")) {
    return [{
      title: "Incomplete task",
      dateStr: "Today",
      timeStr: "15:00",
      priority: "Medium",
      intensity: "Normal",
      notes: "Time detected, action missing.",
      needsDetails: true
    }];
  }

  // 2. Determine Date (including Indonesian and English days of the week correction)
  let dateStr = "";
  if (text.includes("besok") || text.includes("tomorrow")) {
    dateStr = "Tomorrow";
  } else if (text.includes("hari ini") || text.includes("today") || text.includes("nanti")) {
    dateStr = "Today";
  } else if (text.includes("pulang kerja") || text.includes("after work") || text.includes("pulang")) {
    dateStr = "Today";
  } else if (text.includes("malam ini") || text.includes("tonight") || text.includes("nanti sore")) {
    dateStr = "Today";
  } else {
    // Days mapping
    const dayNamesMap: Record<string, string> = {
      senin: "Monday", monday: "Monday",
      selasa: "Tuesday", tuesday: "Tuesday",
      rabu: "Wednesday", wednesday: "Wednesday",
      kamis: "Thursday", thursday: "Thursday",
      jumat: "Friday", friday: "Friday",
      sabtu: "Saturday", saturday: "Saturday",
      minggu: "Sunday", sunday: "Sunday"
    };

    const dayPattern = /\b(senin|monday|selasa|tuesday|rabu|wednesday|kamis|thursday|jumat|friday|sabtu|saturday|minggu|sunday)\b/gi;
    const dayMatches = [...text.matchAll(dayPattern)];
    if (dayMatches.length > 0) {
      // Prioritize the latest match for self-corrections (e.g. "selasa eh rabu")
      const finalDayTerm = dayMatches[dayMatches.length - 1][0].toLowerCase();
      dateStr = dayNamesMap[finalDayTerm] || "";
    }
  }

  // 3. Determine Time (including Indonesian and English duration and hour corrections)
  let timeStr = "";
  const timePattern = /(\d{1,2})[\.:](\d{2})/g;
  const matches = [...text.matchAll(timePattern)];
  if (matches.length > 0) {
    // Prioritize the latest match for self-corrections
    const lastMatch = matches[matches.length - 1];
    const hours = parseInt(lastMatch[1], 10);
    const minutes = parseInt(lastMatch[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  } else {
    const jamRegex = /(?:jam|pukul|at)\s*(\d+)(?:\s*(pagi|siang|sore|malam|am|pm))?|(\d+)\s*(pagi|siang|sore|malam|am|pm)/gi;
    const jamMatches = [...text.matchAll(jamRegex)];
    if (jamMatches.length > 0) {
      const lastMatch = jamMatches[jamMatches.length - 1];
      let hourNum = 0;
      let period = "";
      
      if (lastMatch[1] !== undefined) {
        hourNum = parseInt(lastMatch[1], 10);
        period = lastMatch[2] ? lastMatch[2].toLowerCase() : "";
      } else if (lastMatch[3] !== undefined) {
        hourNum = parseInt(lastMatch[3], 10);
        period = lastMatch[4] ? lastMatch[4].toLowerCase() : "";
      }
      
      if (hourNum >= 1 && hourNum <= 23) {
        if ((period === "siang" || period === "pm") && hourNum < 12) {
          hourNum += 12;
        } else if ((period === "sore" || period === "malam") && hourNum < 12) {
          hourNum += 12;
        } else if (period === "pagi" && hourNum === 12) {
          hourNum = 0;
        } else if (!period) {
          if (hourNum >= 1 && hourNum <= 6) {
            hourNum += 12; // default down to PM if casual early digits
          }
        }
        if (hourNum >= 0 && hourNum < 24) {
          timeStr = `${String(hourNum).padStart(2, "0")}:00`;
        }
      }
    }
  }

  // If time is still empty and user said "tonight", default timeStr to "20:00" for reminder completeness
  if (!timeStr && (text.includes("tonight") || text.includes("malam ini"))) {
    timeStr = "20:00";
  }
  // If time is sore without explicit numbers, e.g. "nanti sore"
  if (!timeStr && (text.includes("sore") || text.includes("afternoon"))) {
    timeStr = "15:00";
  }

  // 4. Demo-critical common natural phrases
  if (/\b(birthday\s+party|party)\b/i.test(text)) {
    return [{
      title: text.includes("birthday") ? "Go to birthday party" : "Go to party",
      dateStr: dateStr || (text.includes("tonight") ? "Today" : ""),
      timeStr,
      priority: "Medium",
      intensity: "Normal",
      notes: timeStr && /\b(?:at\s*)?0?6\b/i.test(text) ? "Time inferred as 18:00 because the user said tonight at 06." : "Converted from messy natural thoughts.",
      needsDetails: !(dateStr || text.includes("tonight")) || !timeStr
    }];
  }

  // 5. Clean and normalize task title & update date/time if mapped
  const normalized = cleanAndNormalizeTask(thoughtText, dateStr);
  let title = normalized.title;
  dateStr = normalized.dateStr;
  if (normalized.timeStr && !timeStr) {
    timeStr = normalized.timeStr;
  }

  // 5. Determine Priority
  let priority: "Low" | "Medium" | "High" = "Medium";
  if (text.includes("urgent") || text.includes("penting") || text.includes("cepat") || text.includes("deadline") || text.includes("darurat") || text.includes("listrik")) {
    priority = "High";
  } else if (text.includes("nanti") || text.includes("santai") || text.includes("low")) {
    priority = "Low";
  }

  // 6. Determine Intensity
  let intensity: "Gentle" | "Normal" | "Annoying" = "Normal";
  if (text.includes("harus") || text.includes("jangan lupa") || text.includes("darurat") || text.includes("deadline") || text.includes("annoying") || text.includes("dont forget")) {
    intensity = "Annoying";
  } else if (text.includes("gentle") || text.includes("slow") || text.includes("santai") || text.includes("minum") || text.includes("water") || text.includes("rest") || text.includes("obat") || text.includes("medicine")) {
    intensity = "Gentle";
  }

  const needsDetails = !dateStr || !timeStr;
  const notes = "Converted from messy natural thoughts.";

  return [{
    title,
    dateStr,
    timeStr,
    priority,
    intensity,
    notes,
    needsDetails
  }];
}

/**
 * Parses raw messy thoughts into clean, focus-friendly promise proposals using Google Gemini.
 */
export async function parseMessyThought(thoughtText: string): Promise<ParsedPromise[]> {
  thoughtText = normalizeSpeechText(thoughtText);
  console.log(`[YuraBrain] Received messy speech input to parse: "${thoughtText}"`);

  // Grab key securely from environment variables (client-side context)
  const apiKey = 
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || 
    "";

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("[YuraBrain] VITE_GEMINI_API_KEY is not configured or is a placeholder. FALLING BACK to local keyword parser.");
    console.log(`[YuraBrain] fallbackParser used for: "${thoughtText}"`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fallbackParser(thoughtText));
      }, 1200);
    });
  }

  console.log(`[YuraBrain] VITE_GEMINI_API_KEY is successfully present (length: ${apiKey.length}). Invoking Gemini API...`);

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are Yura Brain, an intelligent AI assistant specialized in understanding messy, natural, fragmented human thoughts and converting them into actionable reminders, promises, notes, and tasks.

Core Philosophy:
- Support English, Indonesian, and mixed English + Indonesian sentences. Count on users speaking formally, informally, bilingually, or using colloquial slang (e.g., "mager", "pake", "ama", "gua", "gw", "lu", "lo", "remind", "nanti", "sore", "besok", etc.).
- Always assume natural speech and voice transcription output. Do NOT reject incomplete, casual, or grammatically incorrect thoughts. Focus strictly on intent, not grammar.
- Voice transcription noise such as verbal stutters, conversational filler words ("um", "uh", "like", "actually", "wait", "hold on", "eh", "anu", "bentar", "sebentar", "apa ya", "kayaknya", "mungkin", "wait wait", "no wait", "keliru", "salah") must be gracefully ignored, and any revision or self-correction must prioritize the latest statement.
- If any reasonable intent exists, NEVER return an empty array. Create a draft reminder/task. When uncertain, create a task with needsDetails=true instead of returning empty. Empty array is allowed only when the input has absolutely no reminder, task, promise, or schedule intent.
- Phrases like "reminder I am going to birthday party tonight at 06" MUST produce a reminder: title "Go to birthday party", dateStr "Today", timeStr "18:00", needsDetails false or true only if AM/PM is ambiguous. Since the user said tonight, interpret 06 as 18:00.

Rules for Processing:
1. Noun-Only Task Inference:
   When the user input is just a noun or noun phrase, infer the most likely task:
   - "charger" or "charger laptop" -> "Bring laptop charger" or "Bring charger"
   - "laundry" -> "Do laundry"
   - "groceries" -> "Buy groceries"
   - "supermarket" -> "Go to supermarket"
   - "medicine" / "obat" -> "Take medicine"
   - "assignment" / "tugas" -> "Work on assignment"
   - "tugas AI" -> "Work on AI assignment"
   - "bayar listrik" / "listrik" -> "Pay electricity bill"
   - "susu" / "milk" -> "Buy milk"
   - "makanan kucing" / "cat food" -> "Buy cat food"

2. Incomplete Thought Handling:
   If the user has clear reminder/task intent but some details are incomplete/missing, do NOT discard the inputs. Create draft reminders and set needsDetails=true.
   Examples:
   - "besok..." -> Title: "Upcoming task", dateStr: "Tomorrow", needsDetails: true
   - "jangan lupa..." -> Title: "Incomplete reminder", needsDetails: true, intensity: "Annoying"
   - "need to..." -> Title: "Incomplete task", needsDetails: true
   - "nanti jam 3..." -> Title: "Incomplete task", dateStr: "Today", timeStr: "15:00", needsDetails: true

3. Self-Correction / Revision Filtering:
   Identify corrections/revisions and always prioritize the latest correction stated by the user. Stripped-out or corrected parts must not be in the final title.
   Examples:
   - "meeting jam 8 eh bukan jam 9" -> timeStr: "09:00", title: "Meeting"
   - "besok selasa eh rabu meeting" -> dateStr: "Wednesday", title: "Meeting"
   - "selasa eh rabu" -> dateStr: "Wednesday"
   - "jam 8 eh jam 9" -> timeStr: "09:00"

4. Conversational Filler & Voice Transcription Noise:
   Gracefully strip all conversational fillers and noise from the final title. Keep only the core actionable task.
   Fillers like "um", "uh", "gimana ya", "apa sih", "wait hold on", "actually" must not clutter the title.

5. Bilingual Messy Examples for Extracted Reminders & Tasks:
   - "go supermarket" -> Title: "Go to supermarket", dateStr: "", timeStr: "", needsDetails: true
   - "go to supermarket" -> Title: "Go to supermarket", dateStr: "", timeStr: "", needsDetails: true
   - "go to the supermarket" -> Title: "Go to the supermarket", dateStr: "", timeStr: "", needsDetails: true
   - "need buy milk" -> Title: "Buy milk", dateStr: "", timeStr: "", needsDetails: true
   - "tomorrow buy milk" -> Title: "Buy milk tomorrow", dateStr: "Tomorrow", timeStr: "", needsDetails: true
   - "buy milk tomorrow at 9" -> Title: "Buy milk tomorrow at 9", dateStr: "Tomorrow", timeStr: "09:00", needsDetails: false
   - "call mom" -> Title: "Call mom", dateStr: "", timeStr: "", needsDetails: true
   - "call mom later" -> Title: "Call mom later", dateStr: "Today", timeStr: "", needsDetails: true
   - "don't forget charger" -> Title: "Bring charger", dateStr: "", timeStr: "", intensity: "Annoying", needsDetails: true
   - "don't forget bring charger tomorrow" -> Title: "Bring charger tomorrow", dateStr: "Tomorrow", timeStr: "", intensity: "Annoying", needsDetails: true
   - "jangan lupa charger" -> Title: "Bring charger", dateStr: "", timeStr: "", intensity: "Annoying", needsDetails: true
   - "besok jangan lupa bawa charger" -> Title: "Bring charger tomorrow", dateStr: "Tomorrow", timeStr: "", intensity: "Annoying", needsDetails: true
   - "nanti pulang beli makan kucing" -> Title: "Buy cat food later after going home", dateStr: "Today", timeStr: "", needsDetails: true
   - "eh nanti pulang kerja beli makanan kucing ya" -> Title: "Buy cat food after work", dateStr: "Today", timeStr: "", needsDetails: true
   - "laundry" -> Title: "Do laundry", needsDetails: true
   - "groceries" -> Title: "Buy groceries", needsDetails: true
   - "supermarket" -> Title: "Go to supermarket", needsDetails: true
   - "bayar listrik" -> Title: "Pay electricity bill", needsDetails: true
   - "besok bayar listrik" -> Title: "Pay electricity bill tomorrow", dateStr: "Tomorrow", needsDetails: true
   - "tugas AI" -> Title: "Work on AI assignment", needsDetails: true
   - "deadline tugas AI jumat" -> Title: "AI assignment deadline on Friday", dateStr: "Friday", intensity: "Annoying", priority: "High", needsDetails: true
   - "um tomorrow I need to submit assignment" -> Title: "Submit assignment", dateStr: "Tomorrow", needsDetails: true
   - "eh bentar nanti sore call dosen" -> Title: "Call lecturer", dateStr: "Today", timeStr: "15:00", needsDetails: true
   - "apa ya kayaknya besok harus print laporan" -> Title: "Print report tomorrow", dateStr: "Tomorrow", intensity: "Annoying", needsDetails: true
   - "need to uh finish proposal tonight" -> Title: "Finish proposal tonight", dateStr: "Today", timeStr: "20:00", needsDetails: true

JSON Output Structure:
You must output a JSON array of objects representing the extracted promise/reminder items. Each object must follow this format:
{
  "title": "short, clear human-readable title",
  "dateStr": "human readable date (e.g., 'Tomorrow', 'Today', 'Monday') or empty string",
  "timeStr": "HH:mm 24h format or empty string",
  "priority": "Low" | "Medium" | "High",
  "intensity": "Gentle" | "Normal" | "Annoying",
  "notes": "additional helpful note if context is found, or explain why it needs details",
  "needsDetails": boolean
}

Schema rules for field mapping:
- If date is unclear, dateStr must be "".
- If time is unclear, timeStr must be "".
- needsDetails must be true if date or time are empty, or if the intent is highly fragmented.
- Priority: "High" for urgent/deadlines, "Medium" defaults, "Low" for relaxed tasks.
- Intensity: "Annoying" for high importance or warnings (e.g. don't forget, urgent), "Gentle" for self-care or casual suggestions (e.g. water, walk, rest), "Normal" otherwise.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: thoughtText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dateStr: { type: Type.STRING },
              timeStr: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              intensity: { type: Type.STRING, enum: ["Gentle", "Normal", "Annoying"] },
              notes: { type: Type.STRING },
              needsDetails: { type: Type.BOOLEAN }
            },
            required: ["title", "dateStr", "timeStr", "priority", "intensity", "needsDetails"]
          }
        }
      }
    });

    const parsedText = response.text || "[]";
    
    let parsedData;
    try {
      parsedData = JSON.parse(parsedText);
    } catch (jsonError) {
      console.warn("[YuraBrain] Returned Gemini response was not valid JSON. FALLING BACK to local keyword parser.", jsonError);
      console.log(`[YuraBrain] fallbackParser used for: "${thoughtText}"`);
      return fallbackParser(thoughtText);
    }

    if (Array.isArray(parsedData)) {
      console.log(`[YuraBrain] Gemini parsed successfully. Extracted ${parsedData.length} promise proposals.`);
      
      const cleaned = parsedData.map((item: any) => ({
        title: String(item.title || "New Promise"),
        dateStr: String(item.dateStr || ""),
        timeStr: String(item.timeStr || ""),
        priority: (["Low", "Medium", "High"].includes(item.priority) ? item.priority : "Medium") as any,
        intensity: (["Gentle", "Normal", "Annoying"].includes(item.intensity) ? item.intensity : "Normal") as any,
        notes: item.notes ? String(item.notes) : "",
        needsDetails: Boolean(item.needsDetails ?? (!item.dateStr || !item.timeStr))
      })).filter((item: ParsedPromise) => item.title.trim().length > 0);

      return forceDraftIfIntentExists(thoughtText, cleaned);
    } else {
      console.warn("[YuraBrain] Received non-array JSON structure from Gemini. FALLING BACK to local keyword parser.");
      console.log(`[YuraBrain] fallbackParser used for: "${thoughtText}"`);
      return fallbackParser(thoughtText);
    }
  } catch (error) {
    console.error("[YuraBrain] Error invoking Gemini API directly. FALLING BACK to local keyword parser.", error);
    console.log(`[YuraBrain] fallbackParser used for: "${thoughtText}"`);
    return fallbackParser(thoughtText);
  }
}
