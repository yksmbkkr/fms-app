const PROXY_CONFIG = {
  "/private/media/*": {
    "target": "https://fms-cdn-secure.dev.yashkulshreshtha.me/",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "cookieDomainRewrite": "fms-cdn-secure.dev.yashkulshreshtha.me",
    withCredentials: true
  },
  "/apis/*": {
    "target": "http://local.dev.yashkulshreshtha.me:8000/",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "cookieDomainRewrite": "dev.yashkulshreshtha.me",
    withCredentials: true
  }
}

module.exports = PROXY_CONFIG;
