# Security Specification - Aura Dishes

## Data Invariants
- A dish must have a valid name, price, description, and model URL.
- Only authenticated admins can create, update, or delete dishes.
- Anyone can read the list of dishes.
- `createdAt` and `authorId` are immutable after creation.
- `updatedAt` must be set to the server timestamp on every write.

## The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Attempting to create a dish without being logged in.
2. **Non-Admin Write**: Authenticated user (but not admin) trying to create a dish.
3. **Invalid Price**: Create a dish with a negative price.
4. **Missing Fields**: Create a dish missing `modelUrl`.
5. **ID Poisoning**: Attempting to use a 2MB string as a Document ID.
6. **Field Injection**: Adding an `isVerified` field not in the schema.
7. **Identity Spoofing**: Setting `authorId` to a different user's UID.
8. **Immutability Breach**: Attempting to change the `createdAt` timestamp.
9. **PII Leak**: (Not applicable as dishes are public, but if users were added, we'd check).
10. **State Shortcut**: (Not applicable here).
11. **Resource Poisoning**: Sending a 1MB string in the `description`.
12. **System Field Modification**: Attempting to set `updatedAt` to a past date.

## Test Runner (Conceptual)
All payloads above should return `PERMISSION_DENIED`.
