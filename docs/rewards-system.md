# Rewards System

## Currency: Aasha Coin

Aasha Coins are awarded when a student passes an assessment. They are a motivational token — not redeemable for money.

## XP and levels

| Level | XP required |
|-------|-------------|
| Seedling | 0 |
| Learner | 100 |
| Explorer | 300 |
| Scholar | 600 |
| Champion | 1000 |

## Award rules

- 5 Aasha Coins + 10 XP per passed assessment (score ≥ 70)
- No award on failure
- Badges awarded at milestones (first node, 10 nodes, perfect score, simulation master)

## Wallet

Each student has a wallet: `{ aasha_coins, xp, level, badges }`. Wallet is persisted in PostgreSQL in production.

## Display

Wallet is displayed on the student dashboard with the current level badge.
