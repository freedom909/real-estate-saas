# Plan: Complete Payment Subgraph (DDD, mirroring Listing Subgraph)

## Goal
Finish the payment subgraph by fixing bugs, adding missing pieces, and aligning with the listing subgraph's DDD structure. No role renaming (customer stays customer, owner stays owner).

---

## Issues Found

### Critical Bugs
1. **`paymentByBooking` query name mismatch** — Schema defines `paymentByBooking(bookingId)` but resolver key is `paymentByBookingId`. This means the query returns `null`/error at runtime.
2. **`PaymentConfirmedEvent` passes wrong args** — `confirm-payment.usecase.ts` passes `payment.completedAt!` as `checkInDate` and `payment.refundedAt!` as `refundedAt`. Both are wrong; `refundedAt` is `null` at confirmation time.
3. **`PaymentRiskAgent` references undefined imports** — `AnomalyDetectionTool`, `PaymentRiskScoringTool`, `FraudDetectionTool`, `PaymentAIContext` don't exist. File won't compile.
4. **Missing `paymentsByCustomer` query resolver** — Schema defines it, no resolver implements it.
5. **Missing `paymentIntentId` in domain entity** — Schema has `paymentIntentId: String` on Payment, but the entity/model/mapper don't include it.

### Code Quality
6. **File typos** — `payemnt.entity.ts`, `paymentt.status.ts`, `payment.repositoy.ts`
7. **Console.log debugging** — Scattered in `confirm-payment.usecase.ts`, `payment.resolver.ts`
8. **Missing `PaymentFailedEvent`** — Entity has `fail()` method but no event published on failure

---

## Plan

### Phase 1: Fix file typos (rename files, update all imports)

| Old Path | New Path |
|---|---|
| `src/core/payment/domain/entity/payemnt.entity.ts` | `src/core/payment/domain/entity/payment.entity.ts` |
| `src/core/payment/domain/value-object/paymentt.status.ts` | `src/core/payment/domain/value-object/payment.status.ts` |
| `src/core/payment/infra/repository/payment.repositoy.ts` | `src/core/payment/infra/repository/payment.repository.ts` |

Update all imports across:
- `src/core/payment/domain/entity/payment.entity.ts` (internal import of status VO)
- `src/core/payment/domain/repository/i-payment.repository.ts`
- `src/core/payment/infra/repository/payment.repository.ts` (new name)
- `src/core/payment/infra/repository/payment.mapper.ts`
- `src/core/payment/application/usecase/*.ts` (all 6 use cases)
- `src/core/payment/application/agents/paymentRisk.agent.ts`
- `src/core/payment/domain/event/*.ts` (4 event files)
- `src/core/payment/domain/service/paymentTransition.service.ts`
- `src/modules/container/payment.register.ts`
- `src/subgraphs/payment/payment.resolver.ts`

### Phase 2: Add `paymentIntentId` to domain entity + model + mapper

**`src/core/payment/domain/entity/payment.entity.ts`** (after rename):
- Add `paymentIntentId?: string` to `PaymentProps`
- Add getter `get paymentIntentId()`
- Include in `toJSON()`

**`src/core/payment/infra/model/payment.model.ts`**:
- Add `paymentIntentId: { type: DataTypes.STRING, allowNull: true, field: 'payment_intent_id' }` to model init
- Add `public paymentIntentId!: string | null` to class

**`src/core/payment/infra/repository/payment.mapper.ts`**:
- Map `row.paymentIntentId` in `toDomain()`
- Map `data.paymentIntentId` in `toPersistence()`

### Phase 3: Fix `PaymentConfirmedEvent` parameters

**`src/core/payment/domain/event/payment.confirm.event.ts`**:
- Change constructor params from `(paymentId, bookingId, customerId, tenantId, amount, checkInDate, checkOutDate, refundedAt)` to `(paymentId, bookingId, customerId, tenantId, amount, completedAt)`
- Remove `checkInDate`, `checkOutDate`, `refundedAt` — they don't belong on a confirmation event

**`src/core/payment/application/usecase/confirm-payment.usecase.ts`**:
- Fix event construction: `new PaymentConfirmedEvent(payment.id, payment.bookingId, payment.customerId, payment.tenantId, payment.amount, payment.completedAt!)`
- Remove `console.log`

### Phase 4: Fix `paymentByBooking` query name mismatch

**`src/subgraphs/payment/payment.resolver.ts`**:
- Rename resolver key from `paymentByBookingId` to `paymentByBooking` to match schema

### Phase 5: Add `paymentsByCustomer` query resolver + use case

**New file: `src/core/payment/application/usecase/getPaymentsByCustomer.usecase.ts`**:
```typescript
@injectable()
export class GetPaymentsByCustomerUseCase {
  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,
  ) {}

  async execute(customerId: string): Promise<Payment[]> {
    return this.paymentRepository.findByCustomerId(customerId);
  }
}
```

**`src/modules/tokens/payment.tokens.ts`**:
- Add `getPaymentsByCustomerUseCase: Symbol.for("GetPaymentsByCustomerUseCase")`

**`src/modules/container/payment.register.ts`**:
- Register `GetPaymentsByCustomerUseCase`

**`src/subgraphs/payment/payment.resolver.ts`**:
- Add `paymentsByCustomer` resolver that resolves via the new use case

### Phase 6: Add `PaymentFailedEvent`

**New file: `src/core/payment/domain/event/payment.failed.event.ts`**:
```typescript
export class PaymentFailedEvent extends DomainEvent {
  public readonly type = "PAYMENT_FAILED";
  public readonly eventName = "PAYMENT_FAILED";
  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly amount: number,
  ) { super(); }
}
```

**New file: `src/core/payment/application/usecase/fail-payment.usecase.ts`**:
```typescript
@injectable()
export class FailPaymentUseCase {
  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository) private paymentRepository: IPaymentRepository,
    @inject(TOKENS_EVENT_BUS.eventBus) private eventBus: IEventBus,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    payment.fail();
    await this.paymentRepository.save(payment);
    await this.eventBus.publish(new PaymentFailedEvent(payment.id, payment.bookingId, payment.customerId, payment.tenantId, payment.amount));
    return payment.toJSON();
  }
}
```

**Tokens + Registration**: Add `failPaymentUseCase` token and register.

**Schema**: Add `failPayment(paymentId: ID!): ProcessPaymentResponse!` mutation.

**Resolver**: Add `failPayment` resolver.

### Phase 7: Remove `PaymentRiskAgent`

Delete `src/core/payment/application/agents/paymentRisk.agent.ts` — it references undefined types and violates subgraph boundaries. It's not wired into any resolver or use case.

### Phase 8: Clean up console.log debugging

Remove all `console.log` from:
- `src/core/payment/application/usecase/confirm-payment.usecase.ts`
- `src/subgraphs/payment/payment.resolver.ts`
- `src/core/payment/domain/event/payment.eventbus.ts`

---

## Files Modified (summary)

| File | Action |
|---|---|
| `src/core/payment/domain/entity/payemnt.entity.ts` | Rename → `payment.entity.ts`, add `paymentIntentId` |
| `src/core/payment/domain/value-object/paymentt.status.ts` | Rename → `payment.status.ts` |
| `src/core/payment/infra/repository/payment.repositoy.ts` | Rename → `payment.repository.ts` |
| `src/core/payment/infra/model/payment.model.ts` | Add `paymentIntentId` field |
| `src/core/payment/infra/repository/payment.mapper.ts` | Map `paymentIntentId` |
| `src/core/payment/domain/event/payment.confirm.event.ts` | Fix constructor params |
| `src/core/payment/domain/event/payment.failed.event.ts` | **New** — PaymentFailedEvent |
| `src/core/payment/application/usecase/confirm-payment.usecase.ts` | Fix event call, remove console.log |
| `src/core/payment/application/usecase/getPaymentsByCustomer.usecase.ts` | **New** — use case for paymentsByCustomer |
| `src/core/payment/application/usecase/fail-payment.usecase.ts` | **New** — use case for failPayment |
| `src/core/payment/application/agents/paymentRisk.agent.ts` | **Delete** |
| `src/modules/tokens/payment.tokens.ts` | Add 2 new tokens |
| `src/modules/container/payment.register.ts` | Register 2 new use cases |
| `src/subgraphs/payment/schema.graphql` | Add `failPayment` mutation |
| `src/subgraphs/payment/payment.resolver.ts` | Fix query name, add 2 resolvers, remove console.log |
| All use case files + event files + service + repo interface + mapper | Update imports for renamed files |
