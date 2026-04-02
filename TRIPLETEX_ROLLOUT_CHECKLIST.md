# Tripletex rollout checklist

## Safe start
- TRIPLETEX_EXPORT_MODE=stub
- TRIPLETEX_CUSTOMER_SYNC_MODE=stub

## Step 1: customer sync live
- Set TRIPLETEX_CUSTOMER_SYNC_MODE=live
- Keep TRIPLETEX_EXPORT_MODE=stub
- Run customer sync processor
- Verify tripletex_customer_links move from pending -> resolved

## Step 2: export live
- Keep TRIPLETEX_CUSTOMER_SYNC_MODE=live
- Set TRIPLETEX_EXPORT_MODE=real
- Process only exportable queue rows
- Verify remote references are written back correctly

## Never do
- Do not set TRIPLETEX_EXPORT_MODE=real while TRIPLETEX_CUSTOMER_SYNC_MODE=stub
- Do not couple product access to Tripletex export success
