export function maskSecret(value: string | undefined): string {
	if (value == null) return "";
	const str = String(value);
	if (str.length <= 4) return "*".repeat(str.length);
	return `${str.slice(0, 2)}${"*".repeat(str.length - 4)}${str.slice(-2)}`;
}

export async function getSecret(rootDir: string, name: string, env: Record<string, string> = {}): Promise<{ name: string; masked_value: string }> {
	return { name, masked_value: maskSecret(env[name]) };
}

export async function listSecrets(rootDir: string, env: Record<string, string> = {}): Promise<Array<{ name: string }>> {
	return Object.keys(env ?? {}).map((name) => ({ name }));
}

export async function recordSecretAudit(store: any, name: string, action: string): Promise<void> {
	await store.collection("secrets/audit").insert({ name, action, timestamp: new Date().toISOString() });
}
