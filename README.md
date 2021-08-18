# Uniswap Price Monitor

Monitors the relative price of the token in real-time.

I've used 2 ways to fetch real-time prices

1. To continuously query the blockchain to get reserves of tokens in pair contracts.
2. Subscribe to `Sync` event of pair contract to get realtime updates.

### Note

Add HTTPS and WSS endpoints to connect to blockchain, in `.env` file.
