#! /bin/bash

sleep 60s

mount /dev/sda1 /home/you/chain

/home/you/monero/build/Linux/_HEAD_detached_at_b089f9ee6_/release/bin/monerod --rpc-bind-ip 192.168.0.152 --rpc-bind-port 18081 --rpc-restricted-bind-port 11111 --rpc-restricted-bind-ip 192.168.0.152 --p2p-bind-ip 192.168.0.152 --p2p-bind-port 18080 --in-peers 20 --out-peers 40 --data-dir /home/you/chain --confirm-external-bind --enable-dns-blocklist --block-notify '/usr/bin/pkill -USR1 monero-pool' --detach

/home/you/monero/build/Linux/_HEAD_detached_at_b089f9ee6_/release/bin/monero-wallet-rpc --rpc-bind-ip 192.168.0.152 --rpc-bind-port 28084 --password $(cat /home/you/pass) --wallet-file /home/you/monero/build/Linux/_HEAD_detached_at_b089f9ee6_/release/bin/lele --disable-rpc-login --daemon-address 192.168.0.152:18081 --trusted-daemon --confirm-external-bind --detach

sleep 60s

/home/you/monero-pool/build/debug/monero-pool --config-file /home/you/monero-pool/build/debug/pool.conf -f
