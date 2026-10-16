/**
 * OpenAPI 3.1 description of the hosted Ekbasis API, served at GET /api/v1/openapi.json. Written from real responses
 * (2026-10-13) and from the gateway (app/api/v1/[...path]/route.ts, app/api/v1/feedback/route.ts); keep the two in step.
 */
const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string", description: "Human-readable message." },
    code: {
      type: "string",
      description: "Stable, for code. Errors passed through from the model server may have no code.",
      enum: [
        "missing_api_key", "invalid_api_key", "account_suspended", "insufficient_credits", "invalid_request",
        "rate_limited", "not_found", "sessions_unavailable", "model_unavailable", "backend_not_configured",
        "unknown_request_id", "feedback_exists", "body_too_large", "feedback_unavailable",
      ],
    },
    retryable: { type: "boolean", description: "Whether the same request may succeed later (after Retry-After on a 429)." },
  },
}

const err = (description: string) => ({ description, content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } })

const answerHeaders = {
  "X-Ekbasis-Request-Id": { description: "Id of this call (req_ + 24 hex); send it to /feedback.", schema: { type: "string" } },
  "X-Ekbasis-Model": { description: "The model that answered, as listed by /v1/models.", schema: { type: "string" } },
  "X-Ekbasis-Metered-Tokens": { description: "Input tokens billed for this call.", schema: { type: "integer" } },
  "Server-Timing": { description: "auth, bal, queue and model durations in ms.", schema: { type: "string" } },
}

export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "Ekbasis API",
    version: "1.3.0",
    summary: "Ask what an action will do before it runs: typed, calibrated answers in one forward pass.",
    description:
      "The consequence model for AI agents. Describe a state and the actions about to run; ask yes/no, choice or score " +
      "questions about the result; get probabilities read from the model's logits (no text is generated, so there is " +
      "no output charge). Limits, data kept and model versions: https://openinterp.org/ekbasis/api-policies. Clients: " +
      "`pip install ekbasis`, `npm install ekbasis`.",
    license: { name: "Apache-2.0 (clients and weights)", identifier: "Apache-2.0" },
    contact: { name: "OpenInterp", email: "hi@openinterp.org", url: "https://openinterp.org/ekbasis" },
  },
  externalDocs: { description: "Getting started", url: "https://openinterp.org/ekbasis/start" },
  servers: [{ url: "https://openinterp.org/api/v1", description: "Hosted API" }],
  security: [{ bearer: [] }],
  paths: {
    "/v1/systemone": {
      post: {
        operationId: "ask",
        summary: "Answer questions about a state (one request, all questions)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AskRequest" },
              example: {
                state: "A repository has 3 uncommitted files. Action: git reset --hard",
                questions: {
                  lost: { type: "noul", instructions: "Is uncommitted work lost?" },
                  kind: {
                    type: "choice",
                    instructions: "What happens to the 3 files?",
                    criteria: { kept: "they stay as they are", reverted: "their changes are discarded" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "One answer per question, under the same names.",
            headers: answerHeaders,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AskResponse" },
                example: {
                  model: "Ekbasis-27B-INT4",
                  answers: {
                    lost: { type: "noul", noul: 0.967, probability: 0.967, value: true, confidence: 0.967 },
                    kind: { type: "choice", choice: "reverted", probabilities: { kept: 0.06, reverted: 0.94 }, confidence: 0.94 },
                  },
                  usage: { input_tokens: 372, output_tokens: 0 },
                  latency_s: 0.24,
                },
              },
            },
          },
          "400": err("Malformed request (code invalid_request), or a question the model server cannot answer."),
          "401": err("Missing or invalid API key."),
          "402": err("No credits left: buy a credit pack at https://openinterp.org/console."),
          "403": err("Account suspended."),
          "429": {
            description: "The shared model server is full after waiting up to 20 s. Retry after Retry-After seconds.",
            headers: { "Retry-After": { schema: { type: "integer" } } },
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "503": err("The model server is unreachable or could not answer right now (code model_unavailable, retryable)."),
        },
      },
    },
    "/v1/models": {
      get: {
        operationId: "listModels",
        summary: "The model the hosted API serves (one at a time)",
        security: [],
        responses: {
          "200": {
            description: "The served model.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    object: { const: "list" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", examples: ["ekbasis-27b-int4-v1.3"] },
                          object: { const: "model" },
                          owned_by: { type: "string" },
                          weights: { type: "string", description: "Hugging Face repository of the weights." },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        operationId: "health",
        summary: "Setup check: no key, never billed",
        security: [],
        responses: {
          "200": {
            description: "The model server is up.",
            content: { "application/json": { example: { ok: true, model: "Ekbasis-27B-INT4", version: "1.3" } } },
          },
          "503": err("The model server is unreachable."),
        },
      },
    },
    "/feedback": {
      post: {
        operationId: "feedback",
        summary: "Say whether an answer was right (free, 200 per account per UTC day)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["request_id", "verdict"],
                properties: {
                  request_id: { type: "string", pattern: "^req_[0-9a-f]{24}$", description: "X-Ekbasis-Request-Id of one of your calls, up to 30 days old." },
                  verdict: { type: "string", enum: ["correct", "wrong", "prevented_harm", "false_alarm"] },
                  note: { type: "string", maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Recorded.", content: { "application/json": { example: { ok: true, request_id: "req_0123456789abcdef01234567", verdict: "correct" } } } },
          "400": err("Malformed body."),
          "401": err("Missing or invalid API key."),
          "404": err("Unknown request id (code unknown_request_id)."),
          "409": err("Feedback already recorded for this request (code feedback_exists)."),
          "413": err("Body over 4 KB."),
          "429": err("Over 200 feedback calls today."),
        },
      },
    },
  },
  components: {
    securitySchemes: { bearer: { type: "http", scheme: "bearer", description: "API key from https://openinterp.org/console." } },
    schemas: {
      Error: errorSchema,
      Question: {
        description:
          "The model reads the question only from `instructions`. Several answer shapes are accepted, as below; they are " +
          "the forms the clients and the guide use.",
        oneOf: [
          {
            title: "Yes/no",
            type: "object",
            required: ["type", "instructions"],
            properties: {
              type: { enum: ["noul", "boolean"], description: "\"boolean\" is accepted as the same type." },
              instructions: { type: "string", minLength: 1, description: "The question. The model reads only this field." },
              criteria: {
                type: "object",
                properties: { true: { type: "string" }, false: { type: "string" } },
                description: "Optional: what yes and no mean, in a few words each.",
              },
            },
          },
          {
            title: "Choice",
            type: "object",
            required: ["type", "instructions"],
            properties: {
              type: { const: "choice" },
              instructions: { type: "string", minLength: 1 },
              options: { type: "array", minItems: 2, items: { type: "string" }, description: "The possible answers (use this or criteria)." },
              criteria: { type: "object", minProperties: 2, additionalProperties: { type: "string" }, description: "label → short description of that answer (use this or options)." },
            },
          },
          {
            title: "Score",
            type: "object",
            required: ["type", "instructions", "criteria"],
            properties: {
              type: { const: "score" },
              instructions: { type: "string", minLength: 1 },
              criteria: {
                description: "The possible values in order: value → description (e.g. {\"0\": \"none\", \"3\": \"all three\"}), or a list of values.",
                oneOf: [
                  { type: "object", minProperties: 2, additionalProperties: { type: "string" } },
                  { type: "array", minItems: 2, items: { type: "string" } },
                ],
              },
            },
          },
        ],
      },
      AskRequest: {
        type: "object",
        required: ["state", "questions"],
        properties: {
          state: { type: "string", description: "The situation in plain text: rules, how things stand, the actions about to run." },
          questions: { type: "object", minProperties: 1, additionalProperties: { $ref: "#/components/schemas/Question" } },
          read_once: { type: "boolean", description: "Read the state once for all questions (models trained for it)." },
          images: { type: "array", items: { type: "string" }, description: "Data URIs or base64 images, when the served model accepts them." },
        },
      },
      Answer: {
        type: "object",
        required: ["type", "confidence"],
        properties: {
          type: { enum: ["noul", "boolean", "choice", "score"] },
          confidence: { type: "number", description: "Probability of the chosen answer." },
          probability: { type: "number", description: "noul: probability of yes." },
          noul: { type: "number", description: "noul: same as probability (kept for older clients)." },
          value: { type: "boolean", description: "noul: probability ≥ 0.5." },
          choice: { type: "string", description: "choice: the most likely label." },
          score: { description: "score: the most likely value." },
          expected: { type: "number", description: "score: the expected value under the probabilities." },
          probabilities: { type: "object", additionalProperties: { type: "number" }, description: "choice and score: every option's probability." },
          calibrated: {
            type: "object",
            description: "The same answer at a temperature fit on held-out validation (since 2026-10-15): probabilities meant to be read as frequencies. The plain fields above stay the raw probabilities. Python client 0.1.41 / TypeScript SDK 0.2.5: answer.calibrated.",
            properties: {
              temperature: { type: "number" },
              confidence: { type: "number", description: "Calibrated probability of the chosen answer." },
              probability: { type: "number", description: "noul: calibrated probability of yes." },
              probabilities: { type: "object", additionalProperties: { type: "number" }, description: "choice and score: every option's calibrated probability." },
              expected: { type: "number", description: "score: the expected value under the calibrated probabilities." },
            },
          },
        },
      },
      AskResponse: {
        type: "object",
        required: ["answers", "usage"],
        properties: {
          model: { type: "string" },
          answers: { type: "object", additionalProperties: { $ref: "#/components/schemas/Answer" } },
          usage: { type: "object", properties: { input_tokens: { type: "integer" }, output_tokens: { type: "integer", const: 0 } } },
          latency_s: { type: "number", description: "Time in the model server." },
        },
      },
    },
  },
} as const
