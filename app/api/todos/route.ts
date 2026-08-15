import { NextResponse } from "next/server";
import {
  clearCompleted,
  createTodo,
  listTodos,
} from "@/lib/todo-store";

export function GET() {
  return NextResponse.json({ todos: listTodos() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    body &&
    typeof body === "object" &&
    "action" in body &&
    (body as { action?: string }).action === "clearCompleted"
  ) {
    const removed = clearCompleted();
    return NextResponse.json({ removed, todos: listTodos() });
  }

  const title =
    body && typeof body === "object" && "title" in body
      ? String((body as { title: unknown }).title ?? "")
      : "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const todo = createTodo(title);
  return NextResponse.json({ todo }, { status: 201 });
}
