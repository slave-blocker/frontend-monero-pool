# frontend-monero-pool

In the case that you are not mining xmr on p2pool as you should, perhaps you prefer the flavour of running your own pool. Thats why this code exists, to make xmr even more resilient. Before diving into this saga you may want to look at the pics folder for some motivational spoilers.

This is not only the frontend but also the description on how to run a xmr pool on an ubuntu server 24.04, behind a normal retail router. It is not a one click install and not to be followed blindy although all steps are given, adjustments need to be made by you.
It uses a caddy web server, and haproxy. The aim is to be all up to date in the latest ubuntu os, as in the node version of xmr, of the .js and html code regarding the latest firefox and of the pool software. 

First and foremost, thank you to JT-Grassie.

The frontend was adapted from the original code of supportxmr-gui. the code for the frontend alone is under src_web
its content should be placed under /var/www/
the frontend itself is loaded through the "caddy" web server.
figure out how to install the caddy webserver yourself.
then place the Caddyfile under /etc/caddy/Caddyfile

This derives from soontm.xyz, there are two websites, first at port 4243 jt-grassies webui-embed.html wich the pool runs natively, this is by itself without caddy, @ pool.xmr.soontm.xyz. And then there is the website @ soontm.xyz wich is ran over caddy at port 4244. The haproxy software does not do loadbalance, it merely serves the ports and implements the usage of the ssl certs. The cors.lua plugin also allows for the samesite cookies usage.

then install haproxy : sudo apt-get install haproxy 
then place the haproxy.cfg in /etc/haproxy/haproxy.cfg
also place the file cors.lua in /etc/haproxy/cors.lua

In your home directory, follow these instructions :
https://github.com/monero-project/monero?tab=readme-ov-file#compiling-monero-from-source
after that is done, again in the home directory of your server run :

git clone https://github.com/jtgrassie/monero-pool.git

then place the content of src_pool into ~/monero-pool/src/

then while under root : export MONERO_ROOT=/home/you/monero

then @ ~/monero-pool/ , run : "make -j 4" (or whatever your #cpus)

adjust your pool.conf and copy it to ~/monero-pool/build/debug/pool.conf
adjust the rc.local file changing "you" to your hostname, then place the caller.sh file in the respective home directory. The rc.local file, will make the caller.sh file be executed at startup of your machine. Adjust the caller.sh file changing the "local_ip" and the ports to your needs. Also replace the path to the monerod and monero-wallet-rpc according to what you have.

copy the 50-cloud-init.yaml file to the directory /etc/netplan/50-cloud-init.yaml
you need to adjust that to your interface name, also the "local_ip" and your router ip, wich is the gateway of the server.

Also in order to use https you need to use certbot from acme, i.e. "let's Encrypt", figure out how to do that by yourself. once you have the certs, they will be concatenated into one file that also has the private key! And placed under : /etc/ssl/certs/cert.pem
notice how the haproxy.cfg file has the lines :

39 :
for the https : bind :443 ssl crt /etc/ssl/certs/cert.pem

and

53 :

for the ssl mining port : bind :4343 ssl crt /etc/ssl/certs/cert.pem

The buying of the domain is up to you, using a static ipv4 address is simpler and after you have that, direct the A-RECORD from the domain to your static ip. In this case it was done twice, once for soontm.xyz and once for pool.xmr.soontm.xyz.

under the directory src_web/ change the file script_min.js @ line 1496 . that is replace your domain :

    document.cookie = 'wa='+(v || '')+'; expires='+d.toUTCString()+'; path=/'+'; Domain=yourdomain.xyz'+'; SameSite=Strict'; 

Forward the needed ports on the router and secure your server with ssh and strict key only logins. Disable root login, disable X11Forwarding inside the /etc/ssh/sshd_config file.

Note that this pool only allows mining using the self-select option from xmrig.

long live monero

pow or die

Please do contact me for critics, suggestions, questions, kudos, and even mobbing attempts are welcome.

@ irc   **monero-pt**

A do nation is the best nation !

**MONERO** :

![xmr](xmr.gif)

or help me find my first block @ soontm.xyz

