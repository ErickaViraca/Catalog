# [Incident] Elevate Insurance Merge Remap fails on 4 Kipu instances — `PUT …/insurances/{id}/upsert` returns 405 (≈2,276 treatment episodes not synced, ~44K exceptions)

| | |
|---|---|
| **Component** | `EventGridKipuProcessor` → `KipuService.ProcessElevateInsuranceMergeRemapAsync` → `KipuApiClient.SendInsuranceToKipuAsync` |
| **Detected** | 2026-10-06 (Application Insights) |
| **Window (UTC)** | 2026-10-05 21:35 → 2026-10-06 ~11:30 |
| **Severity (proposed)** | Medium — data not synced to Kipu for the affected practices + heavy exception noise |
| **Status** | Root cause identified with high confidence; pending confirmation from Kipu / instance owners |

---

## 1. Summary

The new **Elevate Insurance Merge Remap** process (event `Kind = ElevateInsuranceMergeRemap`, raised as `Update` on `TreatmentEpisode`) pushes each episode's insurance to Kipu through:

```
PUT https://{instance}.kipuworks.com/api/emr/avea/patients/{id}/insurances/{id}/upsert
```

That call **works (HTTP 200) on most Kipu instances**, but **four instances reject it with `405 Method Not Allowed`**:

| Kipu instance | Result |
|---|---|
| `t-billing-clone.kipuworks.com` | 405 (14,760 calls) |
| `s-cms.kipuworks.com` | 405 (162 calls) |
| `istest.kipuworks.com` | 405 (14 calls) |
| `rprc13272.kipuworks.com` | 405 (6 calls) |

Kipu returns the 405 as an **HTML page**. `KipuApiClient.KipuRequest` deserializes the response **without checking the status code**, so it fails with:

```
Newtonsoft.Json.JsonReaderException: Unexpected character encountered while parsing value: <. Path '', line 0, position 0.
```

The exception bubbles up to Event Grid, which **re-delivers each event ~10 times** over ~14 h. Result: ≈2,276 treatment episodes across 5 merge operations were never synced, generating ~44K exceptions.

## 2. Probable root cause

> **The four failing Kipu instances do not expose the `PUT …/patients/{id}/insurances/{id}/upsert` route — most likely because they are not running the same Kipu API version as the instances where it succeeds.**

Why we believe this:

- **Same request, same code, different instance → different result.** The identical endpoint returns 200 on `bld10957`, `springboardrecovery`, `msr11359`, `rhoa12099`, `abhh12803`, `lof11277`, `tprc13213`, `crro13175`, … and 405 only on the four instances above (Evidence E3).
- **405 means the URL exists but the method isn't allowed** → typical of a route that isn't deployed / enabled on that server version, not of bad data (which would be 400/404/422).
- **Deterministic:** retries spaced over hours (low load) keep failing → not throttling or transient outage (E2, E5).
- **Kipu as a whole is healthy:** other `EventGridKipuProcessor` executions keep succeeding at normal rate during the whole incident (E6).
- **The same merge process succeeded earlier on a production instance:** on 2026-10-05 10:00–13:00 UTC, `bld10957` received **8,607** `PUT …/insurances/{id}/upsert` calls, all **200** (E5).
- **3 of 4 failing instances look like non-production environments** (`t-billing-clone`, `s-cms`, `istest`), which are the most likely to lag behind on API version. `rprc13272` looks like a real customer instance and needs separate confirmation.

**Needs confirmation:** Kipu API version / route availability on the 4 instances (see §6, action 1).

## 3. Contributing factors

1. **`KipuApiClient.KipuRequest` does not check `response.IsSuccessStatusCode` / `Content-Type`** before `JsonConvert.DeserializeObject`. A clear `405 MethodNotAllowed` became an opaque JSON parse error.
2. **4xx responses are retried.** A 405/404 can never succeed on retry, but the exception is re-thrown to Event Grid → ~10 deliveries per event → ~10× exception volume.
3. **Every failure is logged twice:** once by the function (`EventGridKipuProcessor`) and once by the Functions host webhook (`POST Host/ExtensionWebHookHandler`, `/runtime/webhooks/eventgrid`).
4. **Event payload is only logged on failure**, so successful merge executions leave no trace of `ElevateInsuranceMergeRemap` — this made the earlier successful run invisible at first.
5. **Production Avea practices appear to be configured against non-production Kipu hosts** (`t-billing-clone`, `s-cms`, `istest`) — to be verified.

## 4. Timeline (UTC)

| Time | Event |
|---|---|
| 2026-10-05 ~10:00–13:00 | Merge remap runs for practice(s) on `bld10957`: 8,607 insurance upserts, **all 200**. A handful of failed executions also visible ~11:00–12:00 (unclassified). |
| 2026-10-05 21:35:18 | First JSON parse error — merge `8fa13aa9-f7fe-4f14-b7ab-b4da0121a1d8` (5 episodes). |
| 2026-10-05 21:51:49 | Merge `ba37e5f2-9e49-4726-a2e4-b4da012465bb` starts failing (**2,232 episodes**). |
| 2026-10-05 22:00–22:03 | Merges `056aa468-…`, `fb49e0e5-…`, `00011684-…` start failing. |
| 2026-10-05 ~21:00 → 2026-10-06 ~11:00 | Event Grid retries: 100–250 failed executions/hour. |
| 2026-10-06 ~11:30 | Failures stop — retries likely exhausted (~10 attempts per event). Events dead-lettered or dropped (to verify). |

## 5. Evidence (with KQL)

All queries run in **Application Insights → Logs**. Each one starts with the same time window so results are reproducible:

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
```

### E1 — Error signature and volume

**Finding:** ~44K `JsonReaderException` thrown at `Newtonsoft.Json.JsonTextReader.ParseValue`, all with `Unexpected character encountered while parsing value: <` (HTML instead of JSON). Logged by the function (29,922) and by the Functions host webhook (14,004) — same failures, counted twice.

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
exceptions
| where timestamp between (StartTime .. EndTime)
| where method == "Newtonsoft.Json.JsonTextReader.ParseValue"
| extend LoggedBy = iff(operation_Name startswith "POST Host/ExtensionWebHookHandler",
                        "Functions host (Event Grid webhook)", operation_Name)
| extend Cause = case(
    innermostMessage has "parsing value: <", "HTML instead of JSON",
    innermostMessage has "Unexpected end",   "Empty or truncated body",
    "Other")
| summarize Exceptions = sum(itemCount),
            FirstSeen  = min(timestamp),
            LastSeen   = max(timestamp),
            Message    = take_any(innermostMessage)
          by LoggedBy, Cause
| order by Exceptions desc
```

**Stack trace (relevant frames):**

```
Newtonsoft.Json.JsonConvert.DeserializeObject[T]
Avea.Office.Services.KipuIntegrations.Emr.KipuApiClient.KipuRequest[TRequest,TResponse]
Avea.Office.Services.KipuIntegrations.Emr.KipuApiClient.SendInsuranceToKipuAsync          KipuApiClient.cs:158
Avea.Office.Services.KipuIntegrations.Emr.KipuService.PutElevateInsuranceMergeRemapAsync  KipuService.cs:911
Avea.Office.Services.KipuIntegrations.Emr.KipuService.ProcessElevateInsuranceMergeRemapAsync KipuService.cs:454
Avea.Office.Services.KipuIntegrations.Emr.KipuService.ProcessMessageAsync                 KipuService.cs:102 / :59
Avea.Office.Services.Sys.BackgroundProcessingService.HandleMessageCoreAsync               BackgroundProcessingService.cs:304 / :333 / :338
Avea.Office.Services.Sys.BackgroundProcessingService.HandleMessageAsync                   BackgroundProcessingService.cs:195
BackgroundProcesses.Triggered.EventGridKipuProcessor.Run                                  EventGridKipuProcessor.cs:53
```

**Event payload (common to all failures):** `Action = Update`, `ObjectType = TreatmentEpisode`, `Entity.Kind = ElevateInsuranceMergeRemap`, `Entity.MergeOperationID = …`, `UserID = 11111111-1111-1111-1111-111111111111` (system user).

### E2 — Affected merge operations, episodes and retries

**Finding:** 5 merge operations, **≈2,276 treatment episodes**, **6–10 delivery attempts per episode**. The older merges reached ~10 attempts → Event Grid max delivery attempts likely = 10.

| MergeOperationID | Episodes | Exceptions | Attempts/episode | First error | Last error |
|---|---|---|---|---|---|
| `ba37e5f2-9e49-4726-a2e4-b4da012465bb` | 2,232 | 13,665 | 6.1 | 10/05 21:51 | 10/06 10:38 |
| `fb49e0e5-7520-4fb0-981d-b4da0128f672` | 34 | 240 | 7.1 | 10/05 22:01 | 10/06 08:49 |
| `8fa13aa9-f7fe-4f14-b7ab-b4da0121a1d8` | 5 | 50 | 10 | 10/05 21:35 | 10/06 08:23 |
| `056aa468-50df-48db-b137-b4da0128ae7e` | 4 | 39 | 9.8 | 10/05 22:00 | 10/06 08:48 |
| `00011684-cf96-4fe9-a561-b4da01293f81` | 1 | 10 | 10 | 10/05 22:02 | 10/06 08:50 |

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
exceptions
| where timestamp between (StartTime .. EndTime)
| where method == "Newtonsoft.Json.JsonTextReader.ParseValue"
| extend cd = tostring(customDimensions)
| extend Kind               = extract(@'Kind[\\"]+:[\\"]+([A-Za-z]+)', 1, cd),
         MergeOperationID   = extract(@'MergeOperationID[\\"]+:[\\"]+([0-9a-f-]{36})', 1, cd),
         TreatmentEpisodeID = extract(@'ObjectID[\\"]+:[\\"]+([0-9a-f-]{36})', 1, cd)
| where isnotempty(TreatmentEpisodeID)          // webhook-level exceptions carry the event payload
| summarize Exceptions        = sum(itemCount),
            TreatmentEpisodes = dcount(TreatmentEpisodeID),
            FirstError        = min(timestamp),
            LastError         = max(timestamp)
          by Kind, MergeOperationID
| extend AttemptsPerEpisode = round(1.0 * Exceptions / TreatmentEpisodes, 1)
| order by Exceptions desc
```

**`ElevateInsuranceMergeRemap` does not appear in logs before 2026-10-05** (30-day lookback) — new process / first run:

```kql
union traces, exceptions
| where timestamp > ago(30d)
| where * has "ElevateInsuranceMergeRemap"
| summarize Events = count() by bin(timestamp, 1d), itemType
| order by timestamp asc
```

### E3 — Same endpoint: 200 on most Kipu instances, 405 on four ⭐ (key evidence)

**Finding:** `PUT /api/emr/avea/patients/{id}/insurances/{id}/upsert` succeeds on every Kipu instance except `t-billing-clone`, `s-cms`, `istest` and `rprc13272`, which return **only 405**.

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
dependencies
| where timestamp between (StartTime .. EndTime)
| where type =~ "HTTP" and target endswith "kipuworks.com"
| extend Endpoint = replace_regex(name, @"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}|\b\d+\b", "{id}")
| where Endpoint == "PUT /api/emr/avea/patients/{id}/insurances/{id}/upsert"
| summarize Calls       = sum(itemCount),
            Succeeded   = sumif(itemCount, resultCode startswith "2"),
            Http405     = sumif(itemCount, resultCode == "405"),
            OtherErrors = sumif(itemCount, not(resultCode startswith "2") and resultCode != "405")
          by KipuInstance = target
| extend Verdict = case(Http405 > 0 and Succeeded == 0, "Rejects PUT upsert (405)",
                        Http405 > 0,                    "Mixed",
                        OtherErrors > 0,                "Other errors",
                                                        "Works")
| order by Http405 desc, Calls desc
```

### E4 — Every failed operation maps to a 405 from Kipu

**Finding:** Inside the operations that threw the JSON exception, the only Kipu calls are the insurance upserts, and **100% of them returned 405** (the remaining dependency is the Raygun error report).

| Kipu instance | Endpoint | Result | Calls | Failed |
|---|---|---|---|---|
| t-billing-clone.kipuworks.com | `PUT …/insurances/{id}/upsert` | 405 | 14,760 | 14,760 |
| s-cms.kipuworks.com | `PUT …/insurances/{id}/upsert` | 405 | 162 | 162 |
| istest.kipuworks.com | `PUT …/insurances/{id}/upsert` | 405 | 14 | 14 |
| rprc13272.kipuworks.com | `PUT …/insurances/{id}/upsert` | 405 | 6 | 6 |

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
let failedOps = exceptions
    | where timestamp between (StartTime .. EndTime)
    | where method == "Newtonsoft.Json.JsonTextReader.ParseValue"
    | distinct operation_Id;
dependencies
| where timestamp between (StartTime .. EndTime)
| where operation_Id in (failedOps)
| where type =~ "HTTP"
| extend Endpoint = replace_regex(name, @"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}|\b\d+\b", "{id}")
| summarize Calls  = sum(itemCount),
            Failed = sumif(itemCount, success == false)
          by Target = target, Endpoint, resultCode
| order by Calls desc
```

*Optional — map each merge operation to its Kipu instance* (may return empty if the webhook and the function use different `operation_Id`s; the volumes above already align `ba37e5f2…` ↔ `t-billing-clone`):

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
let mergeOps = exceptions
    | where timestamp between (StartTime .. EndTime)
    | where method == "Newtonsoft.Json.JsonTextReader.ParseValue"
    | extend MergeOperationID = extract(@'MergeOperationID[\\"]+:[\\"]+([0-9a-f-]{36})', 1, tostring(customDimensions))
    | where isnotempty(MergeOperationID)
    | distinct operation_Id, MergeOperationID;
dependencies
| where timestamp between (StartTime .. EndTime)
| where type =~ "HTTP" and target endswith "kipuworks.com"
| join kind=inner mergeOps on operation_Id
| summarize Calls = sum(itemCount) by MergeOperationID, KipuInstance = target, resultCode
| order by Calls desc
```

### E5 — Timeline: successful run in the morning, 405s at night

**Finding:** 10:00–13:00 UTC → 8,607 upserts with 200 (`bld10957`). From ~21:35 UTC → 405s only, continuing for hours at low rate (retries).

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
dependencies
| where timestamp between (StartTime .. EndTime)
| where type =~ "HTTP" and target endswith "kipuworks.com"
| extend Endpoint = replace_regex(name, @"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}|\b\d+\b", "{id}")
| where Endpoint == "PUT /api/emr/avea/patients/{id}/insurances/{id}/upsert"
| extend Result = case(resultCode startswith "2", "2xx OK",
                       resultCode == "405",       "405 Method Not Allowed",
                                                  strcat(resultCode, " other"))
| summarize Calls = sum(itemCount) by bin(timestamp, 1h), Result
| render timechart
```

### E6 — Kipu itself is healthy (other events keep succeeding)

**Finding:** `EventGridKipuProcessor` successful executions stay at their normal rate (20–130/hour) during the whole incident; failed executions rise only from ~21:00 UTC on 10/05 and drop to 0 at ~11:30 UTC on 10/06.

```kql
let StartTime = datetime(2026-10-04 00:00);
let EndTime   = datetime(2026-10-07 00:00);
traces
| where timestamp between (StartTime .. EndTime)
| where message startswith "Executed 'EventGridKipuProcessor'"
| extend Status = extract(@"\((Succeeded|Failed),", 1, message)
| summarize Executions = count() by bin(timestamp, 1h), Status
| render timechart
```

### E7 — Secondary bug: Kipu patient id missing in URL

**Finding:** at least one call was built with an empty Kipu patient id (`/patients//insurances/…`) → 404 (`aehc12637.kipuworks.com`, `DELETE`). Unrelated to the 405 but in the same flow.

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
dependencies
| where timestamp between (StartTime .. EndTime)
| where type =~ "HTTP" and target endswith "kipuworks.com"
| where name contains "/patients//"
| extend Endpoint = replace_regex(name, @"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}|\b\d+\b", "{id}")
| summarize Calls = sum(itemCount) by KipuInstance = target, Endpoint, resultCode
```

## 6. Action items

| # | Action | Owner |
|---|---|---|
| 1 | **Confirm with Kipu** (or instance owners) the API version on `t-billing-clone`, `s-cms`, `istest`, `rprc13272` and whether `PUT /api/emr/avea/patients/{id}/insurances/{id}/upsert` is available there. A quick check: send `OPTIONS` to the route and inspect the `Allow` header. | TBD |
| 2 | **Identify which Avea practices point to those 4 instances** (`PracticeAdminProfile` / Kipu base URL) and whether production practices should be connected to non-production Kipu hosts (`t-billing-clone`, `s-cms`, `istest`). | TBD |
| 3 | Depending on (1)/(2): upgrade those Kipu instances, **or** exclude them from the merge remap / Kipu sync, **or** fix the practice configuration. | TBD |
| 4 | **`KipuApiClient.KipuRequest`:** check `IsSuccessStatusCode` and `Content-Type` before deserializing; throw a typed `KipuApiException` including method, URL, status code and the first 500 chars of the body. | TBD |
| 5 | **Do not retry non-retryable 4xx** (400, 404, 405, 409, 422) in `BackgroundProcessingService` — log once and complete/flag the message. Keep retries with backoff for 429 / 5xx. | TBD |
| 6 | **Validate Kipu patient id** before building Kipu URLs (E7). | TBD |
| 7 | **Event Grid subscription for `EventGridKipuProcessor`:** confirm max delivery attempts and whether **dead-lettering** is configured. If yes, replay after the fix; if not, re-trigger the remap for the affected episodes (see §8). | TBD |
| 8 | **Re-sync affected episodes** after the fix — at least those on `rprc13272` (appears to be a real customer). | TBD |
| 9 | Add the monitoring alert in §9. | TBD |

## 7. Open questions

- Are `t-billing-clone`, `s-cms` and `istest` test / sandbox instances? Why are they reachable from production?
- Is `rprc13272` a live customer? Which merge operation hit it?
- Who triggered the Elevate Insurance Merge Remap runs on 10/05 (morning and night), and was the night run expected to include these practices?
- What were the few failed executions around 11:00–12:00 UTC on 10/05?

## 8. Appendix — affected treatment episodes (for replay)

Run and **Export → CSV**:

```kql
let StartTime = datetime(2026-10-05 00:00);
let EndTime   = datetime(2026-10-07 00:00);
exceptions
| where timestamp between (StartTime .. EndTime)
| where method == "Newtonsoft.Json.JsonTextReader.ParseValue"
| extend cd = tostring(customDimensions)
| extend MergeOperationID   = extract(@'MergeOperationID[\\"]+:[\\"]+([0-9a-f-]{36})', 1, cd),
         TreatmentEpisodeID = extract(@'ObjectID[\\"]+:[\\"]+([0-9a-f-]{36})', 1, cd)
| where isnotempty(TreatmentEpisodeID)
| summarize Attempts   = sum(itemCount),
            FirstError = min(timestamp),
            LastError  = max(timestamp)
          by MergeOperationID, TreatmentEpisodeID
| order by MergeOperationID, FirstError asc
```

## 9. Appendix — monitoring after the fix

Use as a **log alert** (e.g. every 15 min, threshold > 0) to catch any Kipu instance rejecting our calls:

```kql
dependencies
| where timestamp > ago(15m)
| where type =~ "HTTP" and target endswith "kipuworks.com"
| where resultCode in ("401", "403", "404", "405")
| extend Endpoint = replace_regex(name, @"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}|\b\d+\b", "{id}")
| summarize Calls = sum(itemCount) by KipuInstance = target, Endpoint, resultCode
```

## 10. Acceptance criteria

- [ ] Root cause confirmed for each of the 4 instances (API version / route availability).
- [ ] A Kipu non-2xx response produces an exception that states method, URL and HTTP status (no more `Unexpected character '<'`).
- [ ] Non-retryable 4xx responses are not retried by Event Grid.
- [ ] Affected episodes on production instances re-synced and verified in Kipu.
- [ ] Alert from §9 in place.
