# Frontend Monero Pool

Welcome to the Frontend Monero Pool! If you're not mining XMR on P2Pool, you might prefer the experience of running your own pool. This project aims to enhance the resilience of XMR mining. Before diving into the setup, feel free to check the `pics` folder for some motivational images.

## Overview

This repository contains not only the frontend code but also a comprehensive guide on how to set up a Monero pool on an Ubuntu 24.04 server behind a standard retail router. Please note that this is not a one-click installation; adjustments will be necessary based on your specific environment.

### Key Features

- Utilizes Caddy as the web server and HAProxy for port management.
- Ensures compatibility with the latest versions of Ubuntu, Node.js, and Monero software.
- Adapted from the original code of `supportxmr-gui`.

## Installation Instructions

### Prerequisites

1. **Caddy Web Server**: Install Caddy and configure it to serve the frontend.
   - Place the Caddyfile under `/etc/caddy/Caddyfile`.

2. **HAProxy**: Install HAProxy using the following command:
   ```bash
   sudo apt-get install haproxy
   ```
   - Place the `haproxy.cfg` file in `/etc/haproxy/haproxy.cfg`.
   - Also, place the `cors.lua` file in `/etc/haproxy/cors.lua`.

### Frontend Setup

The frontend code is located in the `src_web` directory. Copy its contents to `/var/www/`.

### Pool Configuration

1. Clone the Monero pool repository:
   ```bash
   git clone https://github.com/jtgrassie/monero-pool.git
   ```
2. Move the contents of `src_pool` into `~/monero-pool/src/`.

3. Set the Monero root environment variable:
   ```bash
   export MONERO_ROOT=/home/your_username/monero
   ```

4. Navigate to the `~/monero-pool/` directory and compile the pool:
   ```bash
   make -j4  # Adjust the number based on your CPU cores
   ```

5. Configure the `pool.conf` file and copy it to `~/monero-pool/build/debug/pool.conf`.

6. Edit the `rc.local` file to replace "your_username" with your hostname. Place the `caller.sh` file in the appropriate home directory. This will ensure that `caller.sh` executes at startup.

7. Adjust the `caller.sh` file to set the correct `local_ip` and ports, and update the paths to `monerod` and `monero-wallet-rpc`.

### Network Configuration

1. Copy the `50-cloud-init.yaml` file to `/etc/netplan/50-cloud-init.yaml` and adjust it for your network interface, `local_ip`, and router IP (gateway).

2. To enable HTTPS, use Certbot from Let's Encrypt. Once you have the certificates, concatenate them into one file (including the private key) and place it under `/etc/ssl/certs/cert.pem`. Ensure your `haproxy.cfg` file includes the following lines:
   ```plaintext
   bind :443 ssl crt /etc/ssl/certs/cert.pem
   bind :4343 ssl crt /etc/ssl/certs/cert.pem
   ```

### Domain Configuration

Purchasing a domain is your responsibility. Using a static IPv4 address simplifies the process. Direct the A-RECORD from your domain to your static IP. In this setup, it was done for both `soontm.xyz` and `pool.xmr.soontm.xyz`.

### Final Adjustments

In the `src_web/` directory, modify the `script_min.js` file at line 1496 to replace `yourdomain.xyz` with your actual domain:
```javascript
document.cookie = 'wa=' + (v || '') + '; expires=' + d.toUTCString() + '; path=/' + '; Domain=yourdomain.xyz' + '; SameSite=Strict';
```

### Security Recommendations

- Forward the necessary ports on your router.
- Secure your server with SSH and enforce strict key-only logins.
- Disable root login and X11 forwarding in the `/etc/ssh/sshd_config` file.

### Important Notes

This pool only supports mining using the self-select option from XMRig.

## Community and Support

Feel free to reach out for feedback, suggestions, questions, or even just to say hello!

- IRC: **monero-pt**

### Donations

If you appreciate this project, consider supporting it!

**MONERO**:

![xmr](xmr.gif)

Or help me find my first block at [soontm.xyz](http://so
