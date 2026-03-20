import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { todos } from "@/db/schema"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"

describe("todoSelectSchema", () => {
	it("validates a valid todo row", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("requires id", () => {
		const row = generateRowWithout(todoSelectSchema, "id")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("requires title", () => {
		const row = generateRowWithout(todoSelectSchema, "title")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("requires completed", () => {
		const row = generateRowWithout(todoSelectSchema, "completed")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("requires priority", () => {
		const row = generateRowWithout(todoSelectSchema, "priority")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("requires created_at", () => {
		const row = generateRowWithout(todoSelectSchema, "created_at")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("requires updated_at", () => {
		const row = generateRowWithout(todoSelectSchema, "updated_at")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("allows null due_date", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse({ ...row, due_date: null })
		expect(result.success).toBe(true)
	})

	it("allows null description", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse({ ...row, description: null })
		expect(result.success).toBe(true)
	})

	it("transforms ISO string timestamps to Date objects", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse({
			...row,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
			expect(result.data.updated_at).toBeInstanceOf(Date)
		}
	})
})

describe("todoInsertSchema", () => {
	it("validates a valid insert row", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("requires title", () => {
		const row = generateRowWithout(todoInsertSchema, "title")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})

describe("todos schema structure", () => {
	it("has the expected columns", () => {
		const columns = Object.keys(todos)
		expect(columns).toContain("id")
		expect(columns).toContain("title")
		expect(columns).toContain("description")
		expect(columns).toContain("completed")
		expect(columns).toContain("priority")
		expect(columns).toContain("due_date")
		expect(columns).toContain("created_at")
		expect(columns).toContain("updated_at")
	})
})
