/**
 * Monster shapes, derived from the generated OpenAPI paths so a backend change
 * surfaces here as a type error (backend ADR-0015).
 */

import type { paths } from "@/vendor/openapi";

type JsonResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = paths[Path][Method] extends {
  responses: { 200: { content: { "application/json": infer Response } } };
}
  ? Response
  : never;

export type MonsterListItem = JsonResponse<
  "/api/mh-wilds/monsters",
  "get"
>[number];
export type MonsterDetail = JsonResponse<
  "/api/mh-wilds/monsters/{id}",
  "get"
>;
export type MonsterPart = MonsterDetail["parts"][number];
export type MonsterWeakness = MonsterDetail["weaknesses"][number];
export type DamageType = keyof MonsterPart["multipliers"];
