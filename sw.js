// TamaPoke 오프라인 캐시: 한 번 열린 파일은 휴대폰에 보관해 두고,
// 인터넷이 없거나 로그인 세션이 끝나도 게임이 열리게 한다.
// 새 버전은 다음 실행 때 반영된다 (정상 응답일 때만 캐시를 갱신).
const CACHE = "tamapoke-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === "navigate" ? new URL("./", location.href).href : req.url;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, {ignoreSearch: true});
    const net = fetch(req).then(res => {
      if (res.ok && !res.redirected && res.type === "basic") cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response("오프라인입니다", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
  }));
});
