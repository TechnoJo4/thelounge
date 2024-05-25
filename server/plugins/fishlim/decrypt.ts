// must have $env:NODE_OPTIONS="--openssl-legacy-provider" for this to work

import Chan from "../../models/chan";
import { Buffer } from "node:buffer";
import { createDecipheriv } from "node:crypto";

const fish64chars = "./0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fish64d = (s) => {
	let out = Buffer.alloc(s.length*8/12);
	let k = 0;
	for (let i = 0; i < s.length; i += 12) {
		let left = 0; let right = 0;
		let j;
		for (j = 0; j < 6; ++j)
			right |= fish64chars.indexOf(s[i+j]) << (j*6);
		for (j = 0; j < 6; ++j)
			left |= fish64chars.indexOf(s[i+6+j]) << (j*6);

		out[k+0] = (left >> 24) & 0xFF;
		out[k+1] = (left >> 16) & 0xFF;
		out[k+2] = (left >> 8) & 0xFF;
		out[k+3] = (left) & 0xFF;
		out[k+4] = (right >> 24) & 0xFF;
		out[k+5] = (right >> 16) & 0xFF;
		out[k+6] = (right >> 8) & 0xFF;
		out[k+7] = (right) & 0xFF;

		k += 8;
	}
	return out;
};

export function tryDecrypt(message, target, network) {
	if (message.startsWith("+OK ")) {
		const cbc = message.startsWith("+OK *");

		const key = network.keys[target];
		if (!key) return "key not found: "+message;

		const b64 = message.substring(cbc ? 5 : 4);
		const bytes = cbc ? Buffer.from(b64, "base64") : fish64d(b64);

		const bf = cbc
			? createDecipheriv("BF-CBC", key, bytes.subarray(0, 8))
			: createDecipheriv("BF-ECB", key, null);
		bf.setAutoPadding(false);

		let decrypted = bf.update(cbc ? bytes.subarray(8) : bytes, undefined, "utf8");
		decrypted += bf.final("utf8");

		return "[" + (cbc ? "CBC" : "ECB") + "] " + decrypted;
	}
}
