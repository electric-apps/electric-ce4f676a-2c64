import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";

export const Route = createFileRoute("/api/mutations/todos")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				const body = parseDates(await request.json());
				const txid = await db.transaction(async (tx) => {
					await tx.insert(todos).values({
						id: body.id,
						title: body.title,
						description: body.description ?? null,
						completed: body.completed ?? false,
						priority: body.priority ?? "medium",
						due_date: body.due_date ?? null,
						created_at: body.created_at ?? new Date(),
						updated_at: body.updated_at ?? new Date(),
					});
					return generateTxId(tx);
				});
				return Response.json({ txid });
			},
			PUT: async ({ request }: { request: Request }) => {
				const body = parseDates(await request.json());
				const txid = await db.transaction(async (tx) => {
					await tx
						.update(todos)
						.set({
							title: body.title,
							description: body.description ?? null,
							completed: body.completed,
							priority: body.priority,
							due_date: body.due_date ?? null,
							updated_at: new Date(),
						})
						.where(eq(todos.id, body.id));
					return generateTxId(tx);
				});
				return Response.json({ txid });
			},
			DELETE: async ({ request }: { request: Request }) => {
				const body = parseDates(await request.json());
				const txid = await db.transaction(async (tx) => {
					await tx.delete(todos).where(eq(todos.id, body.id));
					return generateTxId(tx);
				});
				return Response.json({ txid });
			},
		},
	},
});
