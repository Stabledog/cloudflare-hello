# Cloudflare Wrangler proxy configuration for Bloomberg
# Source this file before running wrangler commands
# from inside the proxy environ.
# source ./cloudflare.bashrc


export HTTP_PROXY=${HTTP_PROXY:-http://proxy.bloomberg.com:81}
export HTTPS_PROXY=${HTTPS_PROXY:-http://proxy.bloomberg.com:81}
export NODE_TLS_REJECT_UNAUTHORIZED=0
