const DB_NAME = 'wallets-db';
const STORE_NAME = 'wallet-store';


function openDB() {
return new Promise<IDBDatabase>((res, rej) => {
const req = indexedDB.open(DB_NAME, 1);
req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME); };
req.onsuccess = () => res(req.result);
req.onerror = () => rej(req.error);
});
}


export async function idbPut(key: string, value: string) {
const db = await openDB();
return new Promise<void>((res, rej) => {
const tx = db.transaction(STORE_NAME, 'readwrite');
tx.objectStore(STORE_NAME).put(value, key);
tx.oncomplete = () => { db.close(); res(); };
tx.onerror = () => { db.close(); rej(tx.error); };
});
}


export async function idbGet(key: string): Promise<string | null> {
const db = await openDB();
return new Promise((res, rej) => {
const tx = db.transaction(STORE_NAME, 'readonly');
const req = tx.objectStore(STORE_NAME).get(key);
req.onsuccess = () => { db.close(); res(req.result ?? null); };
req.onerror = () => { db.close(); rej(req.error); };
});
}


export async function idbGetAll(): Promise<Record<string, string>> {
const db = await openDB();
return new Promise((res, rej) => {
const tx = db.transaction(STORE_NAME, 'readonly');
const store = tx.objectStore(STORE_NAME);
const req = store.getAllKeys();
req.onsuccess = async () => {
const keys = req.result as string[];
const out: Record<string, string> = {};
for (const k of keys) {
const v = await idbGet(k);
if (v !== null) out[k] = v;
}
db.close();
res(out);
};
req.onerror = () => { db.close(); rej(req.error); };
});
}


export async function idbDelete(key: string) {
const db = await openDB();
return new Promise<void>((res, rej) => {
const tx = db.transaction(STORE_NAME, 'readwrite');
tx.objectStore(STORE_NAME).delete(key);
tx.oncomplete = () => { db.close(); res(); };
tx.onerror = () => { db.close(); rej(tx.error); };
});
}