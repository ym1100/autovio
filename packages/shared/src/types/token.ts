export type TokenScope =
  | "projects:read"
  | "projects:write"
  | "works:read"
  | "works:write"
  | "ai:analyze"
  | "ai:generate";

export const ALL_TOKEN_SCOPES: TokenScope[] = [
  "projects:read",
  "projects:write",
  "works:read",
  "works:write",
  "ai:analyze",
  "ai:generate",
];

export interface APITokenMeta {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: TokenScope[];
  lastUsedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
}

export interface CreateTokenRequest {
  name: string;
  scopes: TokenScope[];
  expiresInDays?: number | null;
}

export interface CreateTokenResponse {
  token: string;
  meta: APITokenMeta;
}
