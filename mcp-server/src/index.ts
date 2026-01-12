import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { z } from "zod";

dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies for the /messages endpoint (handled by transport, but good to have)
app.use(express.json());

// Initialize MCP Server
const server = new McpServer({
  name: "Silverguard Voice",
  version: "1.0.0",
});

// Define the Tool
server.tool(
  "create_voice_session",
  "Creates a new OpenAI Realtime voice session using the specific Silverguard Eldercare prompt configuration.",
  {}, // No input arguments needed
  async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in the server environment.");
    }

    console.log("Creating voice session...");

    try {
      // Execute the request exactly as requested
      const response = await axios.post(
        "https://api.openai.com/v1/realtime/sessions",
        {
          prompt: {
            id: "pmpt_696464a11e8c8193b22df8bb67bd8f530cf75992db71453b",
            version: "4"
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
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data)
          }
        ]
      };
    } catch (error: any) {
      console.error("Failed to create voice session:", error.response?.data || error.message);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Failed to create voice session",
              details: error.response?.data || error.message
            })
          }
        ],
        isError: true
      };
    }
  }
);

// Define Tool: fetch_medication_schedule
const fetchMedicationScheduleInputSchema = z.object({
  seniorId: z.string().describe("The ID of the senior whose medication schedule is to be fetched."),
  date: z.string().optional().describe("The date for which to fetch the medication schedule, in YYYY-MM-DD format. Defaults to today's date if not provided.")
});

server.tool(
  "fetch_medication_schedule",
  "Fetches the medication schedule for a given senior on a specific date.",
  fetchMedicationScheduleInputSchema,
  async ({ seniorId, date }) => {
    console.log(`Tool: fetch_medication_schedule called for seniorId: ${seniorId}, date: ${date || 'today'}`);
    // In a real implementation, this would call a Firebase Cloud Function
    // or directly query Firestore for the senior's medication schedule.

    // Mock data for demonstration
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

// Define Tool: trigger_emergency_alert
const triggerEmergencyAlertInputSchema = z.object({
  seniorId: z.string().describe("The ID of the senior for whom to trigger the alert."),
  reason: z.string().describe("A concise description of the emergency or reason for the alert."),
  severity: z.number().int().min(1).max(3).describe("The severity level of the alert (e.g., 3 for critical).")
});

server.tool(
  "trigger_emergency_alert",
  "Triggers an emergency alert for a senior, notifying caregivers and logging the incident.",
  triggerEmergencyAlertInputSchema,
  async ({ seniorId, reason, severity }) => {
    console.log(`Tool: trigger_emergency_alert called for seniorId: ${seniorId}, reason: "${reason}", severity: ${severity}`);
    // In a real implementation, this would:
    // 1. Log a high-priority event to Firestore.
    // 2. Trigger push notifications to all associated caregivers.
    // 3. Potentially initiate an automated call to emergency services based on severity and configuration.

    // Mock response for demonstration
    const timestamp = new Date().toISOString();
    return {
      content: [{ type: "text", text: JSON.stringify({ status: "alert_triggered", seniorId, reason, severity, timestamp }) }]
    };
  }
);

// Transport Management
const transports = new Map<string, SSEServerTransport>();

// SSE Endpoint: Clients connect here to start a session
app.get("/sse", async (req, res) => {
  console.log("New SSE connection attempt");
  
  // The SDK's SSEServerTransport handles writing the initial headers
  const transport = new SSEServerTransport("/messages", res);
  
  // Assuming the transport generates an ID or we can key by the object itself if needed.
  // The SDK usually exposes `sessionId` on the transport.
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

  // The transport handles parsing the body and routing the message to the MCP server
  await transport.handlePostMessage(req, res);
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  Silverguard MCP Server running!
  -------------------------------
  SSE Endpoint: http://localhost:${PORT}/sse
  Tool Name:    create_voice_session
  -------------------------------
  `);
});