# Frontend Monero Pool

Thank you to JT-Grassie!

This is yet another frontend for his Monero mining pool. In the case that you are not mining XMR on P2Pool as you should, perhaps you prefer the flavor of running your own pool. That's why this code exists—to make XMR even more resilient. Before diving into this saga, you may want to look at the `pics` folder for some motivational spoilers.

## Overview

This repository contains not only the frontend code but also a comprehensive guide on how to set up a Monero pool on an Ubuntu 24.04 server behind a standard retail router. Please note that this is not a one-click installation; adjustments will be necessary based on your specific environment.

### Key Features

- Utilizes Caddy as the web server and HAProxy for port management.
- Ensures compatibility with the latest versions of Ubuntu, latest monerod, and the latest browsers.
- Adapted from the original code of `supportxmr-gui`.

## Installation Instructions

### Prerequisites

1. **Caddy Web Server**: Install Caddy.
   - Place the Caddyfile under `/etc/caddy/Caddyfile`.

2. **HAProxy**: Install HAProxy using the following command:
   ```bash
   sudo apt-get install haproxy
   ```
   - Place the `haproxy.cfg` file in `/etc/haproxy/haproxy.cfg`.
   - Also, place the `cors.lua` file in `/etc/haproxy/cors.lua`.

3. **Compile Monero from Source**:
   To set up the mining pool, it is essential to compile Monero from source. Please follow the steps below in your user home directory:

   1. **Clone the Monero Repository:**
      ```bash
      git clone --recursive https://github.com/monero-project/monero
      ```

   2. **Checkout the Specific Version:**
      Navigate to the Monero directory and checkout the last version of Monero with which I was able to run the pool:
      ```bash
      cd monero && git checkout b089f9ee6
      ```

   3. **Initialize and Update Submodules:**
      Ensure that all necessary submodules are initialized and updated:
      ```bash
      git submodule init && git submodule update
      ```

   4. **Compile Monero:**
      Finally, compile the Monero source code. Adjust the number of jobs based on your CPU cores, but avoid using too many to prevent your system from becoming unresponsive:
      ```bash
      make -j4  # Replace '4' with the number of CPU cores you wish to utilize.
      ```

For additional information and requirements, please refer to the [Compiling Monero from Source](https://github.com/monero-project/monero?tab=readme-ov-file#compiling-monero-from-source) section.

### Frontend Setup

The frontend code is located in the `src_web` directory. Copy its contents to `/var/www/`.

### Pool Configuration

1. Clone the Monero pool repository in your home directory:
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
   make -j4  # Adjust the number based on your CPU cores. Do not use too many cores, or your PC may start being unresponsive.
   ```

5. Configure the `pool.conf` file and copy it to `~/monero-pool/build/debug/pool.conf`.

6. Edit the `rc.local` file to replace "your_username" with your hostname. Place the `caller.sh` file in the appropriate home directory. This will ensure that `caller.sh` executes at startup.

7. Adjust the `caller.sh` file to set the correct `local_ip` and ports, and update the paths to `monerod` and `monero-wallet-rpc`.

### Network Configuration

1. Copy the `50-cloud-init.yaml` file to `/etc/netplan/50-cloud-init.yaml` and adjust it for your network interface, `local_ip`, and router IP (gateway).

2. To enable HTTPS, use Certbot from Let's Encrypt. Once you have the certificates, concatenate them into one file (including the private key) and place it under `/etc/ssl/certs/cert.pem`. Notice how the `haproxy.cfg` file has the lines:

**Line 39**: for the HTTPS:
```plaintext
   bind :443 ssl crt /etc/ssl/certs/cert.pem
```

**Line 55**: for the SSL mining port:
```plaintext
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

long live monero

pow or die

Please do contact me for critics, suggestions, questions, kudos, and even mobbing attempts are welcome.

@ irc   **monero-pt**

A do nation is the best nation !

**MONERO**:

![xmr](xmr.gif)

Or help me find my first block at [soontm.xyz](http://soontm.xyz).

