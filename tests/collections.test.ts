import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow } from "./helpers/schema-test-utils"
import { parseDates } from "./helpers/schema-test-utils"

describe("collections insert validation", () => {
	it("validates a todo insert via zod schema", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects insert without title", () => {
		const row = generateValidRow(todoInsertSchema)
		const { title: _title, ...withoutTitle } = row as Record<string, unknown>
		const result = todoInsertSchema.safeParse(withoutTitle)
		expect(result.success).toBe(false)
	})
})

describe("JSON round-trip for todos", () => {
	it("parseDates restores Date objects after JSON round-trip", () => {
		const row = generateValidRow(todoSelectSchema)
		const serialized = JSON.parse(JSON.stringify(row))
		const restored = parseDates(serialized)
		const result = todoSelectSchema.safeParse(restored)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
			expect(result.data.updated_at).toBeInstanceOf(Date)
		}
	})

	it("handles null due_date through JSON round-trip", () => {
		const row = generateValidRow(todoSelectSchema)
		const rowWithNullDate = { ...row, due_date: null }
		const serialized = JSON.parse(JSON.stringify(rowWithNullDate))
		const restored = parseDates(serialized)
		const result = todoSelectSchema.safeParse(restored)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.due_date).toBeNull()
		}
	})
})
