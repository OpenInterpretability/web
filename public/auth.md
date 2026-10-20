# auth.md

Agent registration for the hosted Ekbasis API was **discontinued on 2026-10-20**, together with the hosted API itself.
The registration, token and claim endpoints answer HTTP 410 (`hosted_api_discontinued`), and no new keys are issued.

Ekbasis is now download-only: run the open weights (Apache-2.0) on your own server and point the client at it with
`EKBASIS_URL`. No registration or key is needed for your own server.

- Model and quick start: https://huggingface.co/caiovicentino1/Ekbasis-Skopos-27B-INT4
- How to use Ekbasis from an agent: https://openinterp.org/ekbasis/agents.md
