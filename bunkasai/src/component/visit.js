export function incrementVisit(pageKey) {
  const key = `visits_${pageKey}`;
  const raw = localStorage.getItem(key);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  localStorage.setItem(key, String(count));
  return count;
}

export function getVisits(pageKey) {
  const raw = localStorage.getItem(`visits_${pageKey}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function setVisits(pageKey, value) {
  const key = `visits_${pageKey}`;
  const v = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  localStorage.setItem(key, String(v));
  return v;
}

export function resetVisit(pageKey) {
  return setVisits(pageKey, 0);
}

export function resetAllVisits() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('visits_')) keys.push(k);
  }
  keys.forEach((k) => localStorage.setItem(k, '0'));
  return keys.length;
}
