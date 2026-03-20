import {
	AlertDialog,
	Badge,
	Button,
	Checkbox,
	Container,
	Dialog,
	Flex,
	Heading,
	IconButton,
	Select,
	Spinner,
	Table,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todoCollection } from "@/db/collections/todos";
import type { Todo } from "@/db/zod-schemas";

export const Route = createFileRoute("/")({
	ssr: false,
	loader: async () => {
		await todoCollection.preload();
		return null;
	},
	component: TodoPage,
});

type Filter = "all" | "active" | "completed";
type Priority = "low" | "medium" | "high";

const PRIORITY_COLORS = {
	low: "blue",
	medium: "orange",
	high: "red",
} as const;

function TodoPage() {
	const [filter, setFilter] = useState<Filter>("all");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<Priority>("medium");
	const [dueDate, setDueDate] = useState("");

	const { data: todos, isLoading } = useLiveQuery(
		(q) =>
			q
				.from({ todo: todoCollection })
				.orderBy(({ todo }) => todo.created_at, "desc"),
		[],
	);

	const filteredTodos = (todos ?? []).filter((t) => {
		if (filter === "active") return !t.completed;
		if (filter === "completed") return t.completed;
		return true;
	});

	const completedCount = (todos ?? []).filter((t) => t.completed).length;
	const totalCount = (todos ?? []).length;

	const handleOpenCreate = () => {
		setEditingTodo(null);
		setTitle("");
		setDescription("");
		setPriority("medium");
		setDueDate("");
		setDialogOpen(true);
	};

	const handleOpenEdit = (todo: Todo) => {
		setEditingTodo(todo);
		setTitle(todo.title);
		setDescription(todo.description ?? "");
		setPriority((todo.priority as Priority) ?? "medium");
		setDueDate(
			todo.due_date ? new Date(todo.due_date).toISOString().split("T")[0] : "",
		);
		setDialogOpen(true);
	};

	const handleSubmit = () => {
		if (!title.trim()) return;
		if (editingTodo) {
			todoCollection.update(editingTodo.id, (draft) => {
				draft.title = title.trim();
				draft.description = description.trim() || null;
				draft.priority = priority;
				draft.due_date = dueDate ? new Date(dueDate) : null;
				draft.updated_at = new Date();
			});
		} else {
			todoCollection.insert({
				id: crypto.randomUUID(),
				title: title.trim(),
				description: description.trim() || null,
				completed: false,
				priority,
				due_date: dueDate ? new Date(dueDate) : null,
				created_at: new Date(),
				updated_at: new Date(),
			});
		}
		setDialogOpen(false);
	};

	const handleToggle = (todo: Todo) => {
		todoCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed;
			draft.updated_at = new Date();
		});
	};

	const handleDelete = () => {
		if (deleteTarget) {
			todoCollection.delete(deleteTarget);
			setDeleteTarget(null);
		}
	};

	if (isLoading) {
		return (
			<Flex align="center" justify="center" py="9">
				<Spinner size="3" />
			</Flex>
		);
	}

	return (
		<Container size="3" py="6">
			<Flex direction="column" gap="5">
				{/* Header */}
				<Flex justify="between" align="center">
					<Flex direction="column" gap="1">
						<Heading size="7">Todos</Heading>
						{totalCount > 0 && (
							<Text size="2" color="gray">
								{completedCount} of {totalCount} completed
							</Text>
						)}
					</Flex>
					<Button onClick={handleOpenCreate}>
						<Plus size={16} />
						Add Todo
					</Button>
				</Flex>

				{/* Filter tabs */}
				<Flex gap="2">
					{(["all", "active", "completed"] as Filter[]).map((f) => (
						<Button
							key={f}
							variant={filter === f ? "solid" : "soft"}
							color={filter === f ? "violet" : "gray"}
							size="2"
							onClick={() => setFilter(f)}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</Button>
					))}
				</Flex>

				{/* Todo list */}
				{filteredTodos.length === 0 ? (
					<Flex direction="column" align="center" gap="3" py="9">
						<Inbox size={48} strokeWidth={1} color="var(--gray-8)" />
						<Text size="4" color="gray">
							{filter === "all" ? "No todos yet" : `No ${filter} todos`}
						</Text>
						{filter === "all" && (
							<Button variant="soft" onClick={handleOpenCreate}>
								Create your first todo
							</Button>
						)}
					</Flex>
				) : (
					<Table.Root variant="surface">
						<Table.Body>
							{filteredTodos.map((todo) => (
								<Table.Row
									key={todo.id}
									style={{ opacity: todo.completed ? 0.6 : 1 }}
								>
									<Table.Cell width="44px">
										<Checkbox
											checked={todo.completed}
											onCheckedChange={() => handleToggle(todo)}
										/>
									</Table.Cell>
									<Table.Cell>
										<Flex direction="column" gap="1">
											<Text
												weight="medium"
												style={{
													textDecoration: todo.completed
														? "line-through"
														: "none",
												}}
											>
												{todo.title}
											</Text>
											{todo.description && (
												<Text size="2" color="gray">
													{todo.description}
												</Text>
											)}
											{todo.due_date && (
												<Flex align="center" gap="1">
													<Calendar size={12} color="var(--gray-9)" />
													<Text size="1" color="gray">
														{new Date(todo.due_date).toLocaleDateString()}
													</Text>
												</Flex>
											)}
										</Flex>
									</Table.Cell>
									<Table.Cell width="90px">
										<Badge
											variant="soft"
											color={
												PRIORITY_COLORS[todo.priority as Priority] ?? "gray"
											}
										>
											{todo.priority}
										</Badge>
									</Table.Cell>
									<Table.Cell width="80px">
										<Flex gap="1" justify="end">
											<IconButton
												size="1"
												variant="ghost"
												onClick={() => handleOpenEdit(todo)}
											>
												<Pencil size={14} />
											</IconButton>
											<IconButton
												size="1"
												variant="ghost"
												color="red"
												onClick={() => setDeleteTarget(todo.id)}
											>
												<Trash2 size={14} />
											</IconButton>
										</Flex>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				)}
			</Flex>

			{/* Create/Edit Dialog */}
			<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
				<Dialog.Content maxWidth="450px">
					<Dialog.Title>{editingTodo ? "Edit Todo" : "New Todo"}</Dialog.Title>
					<Flex direction="column" gap="4" mt="4">
						<Flex direction="column" gap="1">
							<Text size="2" weight="medium">
								Title
							</Text>
							<TextField.Root
								placeholder="What needs to be done?"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							/>
						</Flex>
						<Flex direction="column" gap="1">
							<Text size="2" weight="medium">
								Description (optional)
							</Text>
							<TextField.Root
								placeholder="Add a description..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Flex>
						<Flex direction="column" gap="1">
							<Text size="2" weight="medium">
								Priority
							</Text>
							<Select.Root
								value={priority}
								onValueChange={(v) => setPriority(v as Priority)}
							>
								<Select.Trigger placeholder="Select priority" />
								<Select.Content>
									<Select.Item value="low">Low</Select.Item>
									<Select.Item value="medium">Medium</Select.Item>
									<Select.Item value="high">High</Select.Item>
								</Select.Content>
							</Select.Root>
						</Flex>
						<Flex direction="column" gap="1">
							<Text size="2" weight="medium">
								Due date (optional)
							</Text>
							<TextField.Root
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
							/>
						</Flex>
						<Flex gap="3" justify="end" mt="2">
							<Dialog.Close>
								<Button variant="soft" color="gray">
									Cancel
								</Button>
							</Dialog.Close>
							<Button onClick={handleSubmit} disabled={!title.trim()}>
								{editingTodo ? "Save" : "Create"}
							</Button>
						</Flex>
					</Flex>
				</Dialog.Content>
			</Dialog.Root>

			{/* Delete Confirmation */}
			<AlertDialog.Root
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Delete Todo</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This action cannot be undone. This todo will be permanently deleted.
					</AlertDialog.Description>
					<Flex gap="3" justify="end" mt="4">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button color="red" onClick={handleDelete}>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Container>
	);
}
