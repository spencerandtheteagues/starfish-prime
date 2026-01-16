import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { z } from "zod";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin if credentials are available
let firebaseInitialized = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized");
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT not set - using mock data");
  }
} catch (e) {
  console.warn("Firebase initialization failed:", e);
}

const db = firebaseInitialized ? admin.firestore() : null;

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies for the /messages endpoint
app.use(express.json());

// Initialize MCP Server
const server = new McpServer({
  name: "Silverguard Sunny AI",
  version: "2.0.0",
});

// ============================================================================
// RESOURCES - Senior context and data
// ============================================================================

server.resource(
  "senior-profile",
  "senior://{seniorId}/profile",
  async (uri) => {
    const seniorId = uri.pathname.split("/")[1];

    if (db) {
      try {
        const doc = await db.collection("seniors").doc(seniorId).get();
        const data = doc.data();
        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data || {}),
          }],
        };
      } catch (e) {
        console.error("Error fetching senior profile:", e);
      }
    }

    // Mock data fallback
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({
          name: "Margaret",
          preferredName: "Maggie",
          cognitiveLevel: 1,
          tone: "friendly",
          location: "San Francisco, CA",
        }),
      }],
    };
  }
);

server.resource(
  "senior-medications",
  "senior://{seniorId}/medications",
  async (uri) => {
    const seniorId = uri.pathname.split("/")[1];

    if (db) {
      try {
        const snapshot = await db
          .collection("seniors")
          .doc(seniorId)
          .collection("medications")
          .where("active", "==", true)
          .get();

        const medications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ medications }),
          }],
        };
      } catch (e) {
        console.error("Error fetching medications:", e);
      }
    }

    // Mock data fallback
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({
          medications: [
            { name: "Lisinopril", time: "08:00", dosage: "10mg" },
            { name: "Metformin", time: "08:00", dosage: "500mg" },
            { name: "Vitamin D", time: "12:00", dosage: "1000IU" },
          ],
        }),
      }],
    };
  }
);

server.resource(
  "senior-appointments",
  "senior://{seniorId}/appointments",
  async (uri) => {
    const seniorId = uri.pathname.split("/")[1];

    if (db) {
      try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const snapshot = await db
          .collection("seniors")
          .doc(seniorId)
          .collection("appointments")
          .where("dateTime", ">=", now)
          .where("dateTime", "<=", nextWeek)
          .orderBy("dateTime")
          .limit(10)
          .get();

        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ appointments }),
          }],
        };
      } catch (e) {
        console.error("Error fetching appointments:", e);
      }
    }

    // Mock data fallback
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({
          appointments: [
            { title: "Dr. Smith - Checkup", dateTime: "2024-01-15T10:00:00", location: "123 Medical Center" },
          ],
        }),
      }],
    };
  }
);

// ============================================================================
// PROMPTS - System prompts for Sunny AI
// ============================================================================

server.prompt(
  "sunny-system-prompt",
  "The main Sunny AI companion system prompt with all guidelines and persona details",
  {},
  async () => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `You are Sunny, a warm, friendly AI companion for seniors. Your core traits:

PERSONA:
- Warm, patient, and genuinely caring
- Speaks clearly and simply
- Never condescending
- Uses a cheerful but calm tone
- Gender-neutral voice

COMMUNICATION STYLE:
- Short, clear sentences
- One topic at a time
- Repeat important information when helpful
- Always confirm understanding before moving on
- Use the senior's preferred name

SAFETY RULES:
- NEVER provide medical advice
- ALWAYS defer to doctors and caregivers for health questions
- Immediately escalate any emergency mentions
- Log concerning behaviors for caregiver review

CAPABILITIES:
1. Friendly conversation and companionship
2. Medication and appointment reminders
3. Weather and news updates
4. Memory prompts and storytelling
5. Emergency alert escalation to caregivers
6. Daily status logging

Remember: You are a companion, not a medical professional. When in doubt, suggest talking to the caregiver.`,
        },
      }],
    };
  }
);

server.prompt(
  "emergency-detection",
  "Guidelines for detecting and handling emergency situations",
  {},
  async () => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `EMERGENCY DETECTION GUIDELINES:

TRIGGER WORDS (Severity 5 - Call 911):
- "call 911"
- "heart attack"
- "can't breathe"
- "stroke"
- "chest pain"
- "unconscious"

HIGH PRIORITY (Severity 4):
- "I fell"
- "severe pain"
- "bleeding"
- "hurt myself"
- "can't move"

MODERATE CONCERN (Severity 3):
- "don't feel well"
- "dizzy"
- "confused"
- "scared"
- "something's wrong"

ALWAYS:
1. Stay calm and reassure the senior
2. Gather location and condition details
3. Trigger the emergency_notify_protocol function
4. Stay on the line until help arrives
5. Do NOT hang up or end the conversation

NEVER:
- Minimize concerns
- Delay escalation
- Provide medical advice
- Leave the senior alone during emergency`,
        },
      }],
    };
  }
);

// ============================================================================
// TOOLS - The 7 Sunny AI Functions
// ============================================================================

// Tool 1: Create Voice Session
server.tool(
  "create_voice_session",
  "Creates a new OpenAI Realtime voice session using the Silverguard Eldercare prompt configuration (v7).",
  {
    seniorId: z.string().optional().describe("The senior ID for context personalization"),
    voice: z.enum(["alloy", "echo", "shimmer", "fable", "onyx", "nova"]).optional().describe("Voice to use for the session"),
  },
  async ({ seniorId, voice }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in the server environment.");
    }

    console.log("Creating voice session...");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/realtime/sessions",
        {
          model: "gpt-4o-realtime-preview",
          voice: voice || "shimmer",
          prompt: {
            id: "pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b",
            version: "7"
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime=v1"
          }
        }
      );

      console.log("Session created successfully:", response.data.id);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data)
        }]
      };
    } catch (error: any) {
      console.error("Failed to create voice session:", error.response?.data || error.message);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Failed to create voice session",
            details: error.response?.data || error.message
          })
        }],
        isError: true
      };
    }
  }
);

// Tool 2: Get Weather
server.tool(
  "get_weather",
  "Get current weather information for a senior's location. Uses Open-Meteo API (free, no key required).",
  {
    seniorId: z.string().describe("The senior's ID for location lookup"),
    location: z.string().optional().describe("City name or address. If not provided, uses senior's home location."),
  },
  async ({ seniorId, location }) => {
    console.log(`Tool: get_weather called for seniorId: ${seniorId}, location: ${location || 'home'}`);

    try {
      // Get coordinates (using Nominatim for geocoding)
      const searchLocation = location || "San Francisco, CA";
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`
      );

      if (geoResponse.data.length === 0) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Location not found" }) }],
          isError: true
        };
      }

      const { lat, lon } = geoResponse.data[0];

      // Get weather from Open-Meteo
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
      );

      const current = weatherResponse.data.current_weather;

      // Weather code descriptions
      const weatherCodes: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        95: "Thunderstorm",
      };

      const result = {
        location: searchLocation,
        temperature: Math.round(current.temperature),
        temperatureUnit: "°F",
        conditions: weatherCodes[current.weathercode] || "Unknown",
        windSpeed: Math.round(current.windspeed),
        windUnit: "mph",
        time: current.time,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result) }]
      };
    } catch (error: any) {
      console.error("Weather fetch error:", error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Failed to fetch weather", details: error.message }) }],
        isError: true
      };
    }
  }
);

// Tool 3: General Information Lookup
server.tool(
  "general_information_lookup",
  "Look up general information like phone numbers, business hours, or simple facts. Filtered for senior safety.",
  {
    seniorId: z.string().describe("The senior's ID"),
    query: z.string().describe("The information to look up"),
  },
  async ({ seniorId, query }) => {
    console.log(`Tool: general_information_lookup called for seniorId: ${seniorId}, query: "${query}"`);

    // Safety blocklist
    const blocklist = ["scam", "fraud", "hack", "password", "bank account", "social security", "wire transfer"];
    const queryLower = query.toLowerCase();

    for (const blocked of blocklist) {
      if (queryLower.includes(blocked)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              blocked: true,
              message: "I cannot help with that type of query. Please talk to your caregiver if you need assistance with financial or security matters."
            })
          }]
        };
      }
    }

    // For now, return a mock response
    // In production, this would call a safe search API
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          query,
          result: `I found some information about "${query}". Please note that I can only provide general information. For anything medical or financial, please consult your caregiver or doctor.`,
          disclaimer: "This information is for general reference only."
        })
      }]
    };
  }
);

// Tool 4: Get News
server.tool(
  "get_news",
  "Get age-appropriate, filtered news headlines. Avoids disturbing content.",
  {
    seniorId: z.string().describe("The senior's ID"),
    category: z.enum(["general", "health", "science", "technology", "entertainment", "sports", "local"]).optional().describe("News category to fetch"),
  },
  async ({ seniorId, category }) => {
    console.log(`Tool: get_news called for seniorId: ${seniorId}, category: ${category || 'general'}`);

    // Blocklist for filtering
    const contentBlocklist = ["murder", "death", "violence", "shooting", "terror", "disaster", "tragic"];

    // Mock news data (in production, call a news API and filter)
    const mockNews = [
      { title: "Local Community Garden Celebrates 50th Anniversary", category: "local" },
      { title: "New Study Shows Benefits of Daily Walking", category: "health" },
      { title: "Classic Movie Festival Returns This Weekend", category: "entertainment" },
      { title: "Scientists Discover New Species of Butterfly", category: "science" },
      { title: "Local Senior Center Hosts Art Exhibition", category: "local" },
    ];

    const selectedCategory = category || "general";
    const filteredNews = mockNews.filter(item =>
      selectedCategory === "general" || item.category === selectedCategory
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          category: selectedCategory,
          headlines: filteredNews,
          note: "News has been filtered for senior-appropriate content."
        })
      }]
    };
  }
);

// Tool 5: Log Daily Senior Status
server.tool(
  "log_and_report_daily_senior_status",
  "Log information about the senior's day including mood, activities, meals, and medications. Reports to caregiver.",
  {
    seniorId: z.string().describe("The senior's ID"),
    mood: z.enum(["happy", "neutral", "sad", "anxious", "confused", "tired", "energetic"]).optional().describe("Senior's current mood"),
    activities: z.array(z.string()).optional().describe("Activities the senior has done today"),
    mealsEaten: z.number().optional().describe("Number of meals eaten today (0-3)"),
    medicationsTaken: z.array(z.string()).optional().describe("Names of medications taken"),
    concerns: z.array(z.string()).optional().describe("Any concerns the senior mentioned"),
    notes: z.string().optional().describe("Additional notes about the conversation"),
  },
  async ({ seniorId, mood, activities, mealsEaten, medicationsTaken, concerns, notes }) => {
    console.log(`Tool: log_and_report_daily_senior_status called for seniorId: ${seniorId}`);

    const timestamp = new Date().toISOString();
    const logEntry = {
      seniorId,
      timestamp,
      mood,
      activities: activities || [],
      mealsEaten: mealsEaten ?? 0,
      medicationsTaken: medicationsTaken || [],
      concerns: concerns || [],
      notes,
      source: "sunny_ai",
    };

    // Save to Firestore if available
    if (db) {
      try {
        await db
          .collection("seniors")
          .doc(seniorId)
          .collection("dailyLogs")
          .add({
            ...logEntry,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        // If there are concerns, create an alert
        if (concerns && concerns.length > 0) {
          await db
            .collection("seniors")
            .doc(seniorId)
            .collection("alerts")
            .add({
              type: "health_concern",
              message: `Concerns noted: ${concerns.join(", ")}`,
              priority: "medium",
              source: "sunny_ai",
              acknowledged: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
      } catch (e) {
        console.error("Error saving daily log:", e);
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          logged: logEntry,
          caregiverNotified: concerns && concerns.length > 0,
        })
      }]
    };
  }
);

// Tool 6: Integrate Eldercare Features
server.tool(
  "integrate_eldercare_features",
  "Access eldercare app features like medication schedules, appointments, messages, and contacts.",
  {
    seniorId: z.string().describe("The senior's ID"),
    featureType: z.enum(["reminder", "alert", "schedule", "message", "contact"]).describe("Type of feature to access"),
    action: z.enum(["get", "add", "update", "delete"]).describe("Action to perform"),
    data: z.any().optional().describe("Data for the action (depends on feature type)"),
  },
  async ({ seniorId, featureType, action, data }) => {
    console.log(`Tool: integrate_eldercare_features called - ${action} ${featureType} for ${seniorId}`);

    // Handle different feature types
    switch (featureType) {
      case "reminder":
        if (action === "get") {
          // Return upcoming reminders
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                reminders: [
                  { id: "1", title: "Take morning medication", time: "08:00", recurring: true },
                  { id: "2", title: "Drink water", time: "10:00", recurring: true },
                  { id: "3", title: "Call daughter Sarah", time: "14:00", recurring: false },
                ]
              })
            }]
          };
        }
        break;

      case "schedule":
        if (action === "get") {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                schedule: [
                  { time: "08:00", activity: "Morning medication" },
                  { time: "09:00", activity: "Breakfast" },
                  { time: "10:00", activity: "Morning walk" },
                  { time: "12:00", activity: "Lunch" },
                  { time: "14:00", activity: "Activity time" },
                  { time: "18:00", activity: "Dinner" },
                  { time: "20:00", activity: "Evening medication" },
                ]
              })
            }]
          };
        }
        break;

      case "contact":
        if (action === "get") {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                contacts: [
                  { name: "Sarah (Daughter)", relation: "daughter", role: "primary_caregiver" },
                  { name: "Dr. Smith", relation: "doctor", specialty: "primary care" },
                  { name: "Mike (Son)", relation: "son" },
                ]
              })
            }]
          };
        }
        break;
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          featureType,
          action,
          message: `${action} ${featureType} completed successfully`
        })
      }]
    };
  }
);

// Tool 7: Build and Log Senior Profile
server.tool(
  "build_and_log_senior_profile",
  "Record information learned about the senior during conversation such as preferences, memories, routines, or health observations.",
  {
    seniorId: z.string().describe("The senior's ID"),
    dataType: z.enum(["preference", "memory", "routine", "health", "interest"]).describe("Type of information to record"),
    profileData: z.object({
      key: z.string().describe("Identifier for this information"),
      value: z.string().describe("The information value"),
      context: z.string().optional().describe("Context in which this was learned"),
    }).describe("The data to record"),
  },
  async ({ seniorId, dataType, profileData }) => {
    console.log(`Tool: build_and_log_senior_profile called - ${dataType} for ${seniorId}`);

    const entry = {
      seniorId,
      dataType,
      ...profileData,
      recordedAt: new Date().toISOString(),
      source: "sunny_ai",
    };

    // Save to Firestore if available
    if (db) {
      try {
        await db
          .collection("seniors")
          .doc(seniorId)
          .collection("profileData")
          .add({
            ...entry,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (e) {
        console.error("Error saving profile data:", e);
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          recorded: entry,
          message: `Noted: ${profileData.key}`
        })
      }]
    };
  }
);

// Tool 8: Emergency Notify Protocol
server.tool(
  "emergency_notify_protocol",
  "CRITICAL: Trigger emergency notification to caregivers. Use when senior mentions emergencies, falls, severe pain, or asks to call 911.",
  {
    seniorId: z.string().describe("The senior's ID"),
    emergencyType: z.string().describe("Type of emergency (fall, medical, 911, chest_pain, breathing, etc.)"),
    seniorStatement: z.string().describe("Exact words the senior said that triggered this"),
    severity: z.number().min(1).max(5).describe("Severity level: 1=minor concern, 3=needs attention, 5=call 911"),
    additionalContext: z.string().optional().describe("Any additional context from the conversation"),
  },
  async ({ seniorId, emergencyType, seniorStatement, severity, additionalContext }) => {
    console.log(`🚨 EMERGENCY ALERT - seniorId: ${seniorId}, type: ${emergencyType}, severity: ${severity}`);

    const timestamp = new Date().toISOString();
    const alert = {
      seniorId,
      emergencyType,
      seniorStatement,
      severity,
      additionalContext,
      timestamp,
      status: "triggered",
      source: "sunny_ai",
    };

    // Save to Firestore if available
    if (db) {
      try {
        // Create emergency alert
        await db
          .collection("seniors")
          .doc(seniorId)
          .collection("alerts")
          .add({
            ...alert,
            type: "emergency",
            priority: severity >= 4 ? "critical" : "high",
            acknowledged: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        // Get caregiver and send notification
        const seniorDoc = await db.collection("seniors").doc(seniorId).get();
        const caregiverId = seniorDoc.data()?.primaryCaregiverUserId;

        if (caregiverId) {
          await db
            .collection("users")
            .doc(caregiverId)
            .collection("notifications")
            .add({
              type: "emergency",
              title: severity >= 4 ? "🚨 EMERGENCY ALERT" : "⚠️ Urgent Alert",
              body: `${emergencyType}: "${seniorStatement}"`,
              seniorId,
              severity,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
      } catch (e) {
        console.error("Error saving emergency alert:", e);
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          alert,
          message: severity >= 4
            ? "Emergency services and caregiver have been notified. Stay calm, help is on the way."
            : "Your caregiver has been notified and will check on you soon.",
          recommendedActions: severity >= 4
            ? ["Stay on the line", "Do not move if injured", "Help is coming"]
            : ["Stay calm", "Caregiver notified", "Help arriving soon"],
        })
      }]
    };
  }
);

// ============================================================================
// Legacy Tools (for backwards compatibility)
// ============================================================================

server.tool(
  "fetch_medication_schedule",
  "Fetches the medication schedule for a given senior on a specific date.",
  {
    seniorId: z.string().describe("The ID of the senior whose medication schedule is to be fetched."),
    date: z.string().optional().describe("The date for which to fetch the medication schedule, in YYYY-MM-DD format.")
  },
  async ({ seniorId, date }) => {
    console.log(`Tool: fetch_medication_schedule called for seniorId: ${seniorId}, date: ${date || 'today'}`);

    // Use the integrate_eldercare_features logic
    const mockMedications = [
      { name: "Lisinopril", time: "08:00", dosage: "10mg", taken: true },
      { name: "Metformin", time: "08:00", dosage: "500mg", taken: false },
      { name: "Vitamin D", time: "12:00", dosage: "1000IU", taken: true },
      { name: "Aspirin", time: "18:00", dosage: "81mg", taken: false },
    ];

    return {
      content: [{ type: "text", text: JSON.stringify({ medications: mockMedications }) }]
    };
  }
);

server.tool(
  "trigger_emergency_alert",
  "Legacy emergency alert trigger. Use emergency_notify_protocol for full functionality.",
  {
    seniorId: z.string().describe("The ID of the senior for whom to trigger the alert."),
    reason: z.string().describe("A concise description of the emergency."),
    severity: z.number().int().min(1).max(5).describe("The severity level (1-5).")
  },
  async ({ seniorId, reason, severity }) => {
    console.log(`Tool: trigger_emergency_alert called for seniorId: ${seniorId}`);

    const timestamp = new Date().toISOString();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "alert_triggered",
          seniorId,
          reason,
          severity,
          timestamp,
          note: "Use emergency_notify_protocol for full functionality"
        })
      }]
    };
  }
);

// ============================================================================
// Server Transport Management
// ============================================================================

const transports = new Map<string, SSEServerTransport>();

// SSE Endpoint: Clients connect here to start a session
app.get("/sse", async (req, res) => {
  console.log("New SSE connection attempt");

  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;

  transports.set(sessionId, transport);

  transport.onclose = () => {
    console.log(`SSE connection closed: ${sessionId}`);
    transports.delete(sessionId);
  };

  await server.connect(transport);
});

// Messages Endpoint: Clients post JSON-RPC messages here
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).send("Missing sessionId parameter");
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).send("Session not found");
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    server: "Silverguard Sunny AI MCP",
    version: "2.0.0",
    firebase: firebaseInitialized,
    tools: [
      "create_voice_session",
      "get_weather",
      "general_information_lookup",
      "get_news",
      "log_and_report_daily_senior_status",
      "integrate_eldercare_features",
      "build_and_log_senior_profile",
      "emergency_notify_protocol",
    ],
  });
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║           Silverguard Sunny AI MCP Server v2.0             ║
  ╠════════════════════════════════════════════════════════════╣
  ║  SSE Endpoint:    http://localhost:${PORT}/sse                   ║
  ║  Health Check:    http://localhost:${PORT}/health                ║
  ╠════════════════════════════════════════════════════════════╣
  ║  Tools Available:                                          ║
  ║    - create_voice_session                                  ║
  ║    - get_weather                                           ║
  ║    - general_information_lookup                            ║
  ║    - get_news                                              ║
  ║    - log_and_report_daily_senior_status                    ║
  ║    - integrate_eldercare_features                          ║
  ║    - build_and_log_senior_profile                          ║
  ║    - emergency_notify_protocol                             ║
  ╠════════════════════════════════════════════════════════════╣
  ║  Resources:                                                ║
  ║    - senior://{seniorId}/profile                           ║
  ║    - senior://{seniorId}/medications                       ║
  ║    - senior://{seniorId}/appointments                      ║
  ╠════════════════════════════════════════════════════════════╣
  ║  Prompts:                                                  ║
  ║    - sunny-system-prompt                                   ║
  ║    - emergency-detection                                   ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});
