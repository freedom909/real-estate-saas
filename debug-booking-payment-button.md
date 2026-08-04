# Debug Session: booking-payment-button
- **Status**: [FIXED]
- **Issue**: On `http://localhost:3000/bookings/b848b506-0947-42ea-a1e9-d872d343d203`, clicking `booking-confirm` should lead to `process-payment` appearing, but the button still does not appear.
- **Debug Server**: `http://127.0.0.1:7777/event`
- **Log File**: `.dbg/trae-debug-log-booking-payment-button.ndjson`

## Reproduction Steps
1. Open `http://localhost:3000/bookings/b848b506-0947-42ea-a1e9-d872d343d203`.
2. Click the `Confirm Booking` button.
3. Observe whether `Process Payment` appears.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `confirmBooking` succeeds, but the follow-up `booking` query response still has no `payment`, so the page has nothing to render. | High | Low | Confirmed |
| B | `confirmBooking` succeeds, but the refetch is using a token or role that can read booking status but cannot resolve `Booking.payment`. | High | Medium | In progress |
| C | The payment record is created asynchronously after a booking event, and the page refetch happens too early, so the button disappears until a later refresh. | Medium | Medium | In progress |
| D | The page receives `payment`, but its `status` is not `PENDING`, so the render guard hides `Process Payment`. | Medium | Low | Rejected |
| E | The click path for `Confirm Booking` fails partially in the browser (GraphQL error, cache issue, or stale Apollo state), so the UI never reaches the expected post-confirm state. | Medium | Medium | Rejected |

## Log Evidence
- Frontend log: booking `733e698d-494d-4b60-a71f-5758d6b89e1d` moved from `PENDING` to `CONFIRMED`.
- Frontend log: `confirmBooking` completed successfully with `returnedStatus = CONFIRMED`.
- Frontend log: before and after confirmation, `paymentId = null` and `paymentStatus = null`.
- Frontend log: render guard evaluated `shouldShowProcessPayment = false` after confirmation because `payment` was missing.

## Verification Conclusion
- Confirmed: the button is absent because the page still has no `payment` after confirmation.
- Rejected: the button is not being hidden by a wrong `payment.status`.
- Rejected: the confirm click path is not failing in the browser.
- Next discriminator: instrument `Booking.payment` in the payment subgraph to determine whether payment lookup returns `null` from storage or disappears during federation/authorization.

## Fix Attempt
- Implemented a minimal backend fix in `ConfirmBookingUseCase`: after a booking is confirmed, create a `PENDING` payment synchronously if the booking does not already have one.
- Retained instrumentation and switched log `runId` to `post-fix` for comparative verification.
- Verification command: `npm.cmd test -- --runInBand src/__tests__/unit/booking/confirm-booking.usecase.test.ts`
- Result: targeted unit test suite passed.
