import axios from "axios";

function pickProvider(){
  const p = (process.env.MODEL_PROVIDER || 'openai').toLowerCase();
  return p;
}

export async function completeJSON(prompt, schema){
  const provider = pickProvider();
  const headers = {};
  let url, body;
  if (provider === 'openai') {
    url = "https://api.openai.com/v1/chat/completions";
    headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
    body = { model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } };
  } else if (provider === 'anthropic') {
    url = "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = process.env.ANTHROPIC_API_KEY;
    headers["anthropic-version"] = "2023-06-01";
    body = { model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620", max_tokens: 2048, messages: [{ role: "user", content: prompt }] };
  } else {
    url = "https://generativelanguage.googleapis.com/v1beta/models/" + (process.env.GOOGLE_MODEL || "gemini-1.5-pro") + ":generateContent?key=" + process.env.GOOGLE_API_KEY;
    body = { contents: [{ role: "user", parts: [{ text: prompt }] }]};
  }
  const r = await axios.post(url, body, { headers });
  if (provider === 'openai') {
    const txt = r.data.choices[0].message.content;
    return JSON.parse(txt);
  } else if (provider === 'anthropic') {
    const txt = r.data.content[0].text;
    return JSON.parse(txt);
  } else {
    const txt = r.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(txt);
  }
}

export async function completeText(prompt){
  const provider = pickProvider();
  const headers = {};
  let url, body;
  if (provider === 'openai') {
    url = "https://api.openai.com/v1/chat/completions";
    headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
    body = { model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "user", content: prompt }] };
    const r = await axios.post(url, body, { headers });
    return r.data.choices[0].message.content;
  } else if (provider === 'anthropic') {
    url = "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = process.env.ANTHROPIC_API_KEY;
    headers["anthropic-version"] = "2023-06-01";
    body = { model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620", max_tokens: 2048, messages: [{ role: "user", content: prompt }] };
    const r = await axios.post(url, body, { headers });
    return r.data.content[0].text;
  } else {
    url = "https://generativelanguage.googleapis.com/v1beta/models/" + (process.env.GOOGLE_MODEL || "gemini-1.5-pro") + ":generateContent?key=" + process.env.GOOGLE_API_KEY;
    body = { contents: [{ role: "user", parts: [{ text: prompt }] }]};
    const r = await axios.post(url, body);
    return r.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}
