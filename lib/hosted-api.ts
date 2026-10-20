/**
 * The hosted Ekbasis API (openinterp.org/api/v1, API keys, credit packs, coupons and agent registration) was
 * discontinued on 2026-10-20 by the owner's decision. Ekbasis is download-only from then on: the weights and the
 * System One server are public on Hugging Face, and the client talks to a local server through EKBASIS_URL.
 *
 * HOSTED_API_ON is the single switch: every route that sold credits, issued keys or served the model returns
 * `discontinued()` while it is false. Reading keys, revoking them and the admin pages keep working.
 */
export const HOSTED_API_ON = false

export const HOSTED_API_DISCONTINUED_AT = "2026-10-20"

export const MODEL_DOWNLOADS = [
  {
    id: "caiovicentino1/Ekbasis-Skopos-27B-INT4",
    url: "https://huggingface.co/caiovicentino1/Ekbasis-Skopos-27B-INT4",
    note: "the model the hosted API served last (GPTQ W4A16, vLLM)",
  },
  {
    id: "caiovicentino1/Ekbasis-27B-INT4",
    url: "https://huggingface.co/caiovicentino1/Ekbasis-27B-INT4",
    note: "the earlier release (GPTQ W4A16, vLLM)",
  },
  {
    id: "caiovicentino1/Ekbasis-27B-MLX-4bit",
    url: "https://huggingface.co/caiovicentino1/Ekbasis-27B-MLX-4bit",
    note: "for Apple silicon (MLX)",
  },
] as const

export const MODEL_DOWNLOAD_URL = MODEL_DOWNLOADS[0].url

/** The model card's quick start, unchanged (Hugging Face, caiovicentino1/Ekbasis-Skopos-27B-INT4). */
export const SELF_HOST_QUICK_START = [
  "hf download caiovicentino1/Ekbasis-Skopos-27B-INT4 --local-dir Ekbasis-Skopos-27B-INT4",
  "bash Ekbasis-Skopos-27B-INT4/serve_vllm.sh Ekbasis-Skopos-27B-INT4 8001",
  "python Ekbasis-Skopos-27B-INT4/serve.py --model Ekbasis-Skopos-27B-INT4 --vllm-url http://127.0.0.1:8001 --port 8000",
  'pip install ekbasis && EKBASIS_URL=http://127.0.0.1:8000 ekbasis git-check -- "git reset --hard"',
].join("\n")

export const DISCONTINUED_MESSAGE =
  `The hosted Ekbasis API was discontinued on ${HOSTED_API_DISCONTINUED_AT}: no new keys, credits or requests. ` +
  `Ekbasis is now download-only. Get the weights and the System One server at ${MODEL_DOWNLOAD_URL} and run it ` +
  "yourself; the client reaches it with EKBASIS_URL=http://127.0.0.1:8000."

/** 410 in the gateway's error shape ({ error, code, retryable }), so existing clients print the message. */
export function discontinued(): Response {
  return Response.json(
    { error: DISCONTINUED_MESSAGE, code: "hosted_api_discontinued", retryable: false, download: MODEL_DOWNLOAD_URL },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  )
}
