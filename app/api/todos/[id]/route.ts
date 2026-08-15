import { NextResponse } from "next/server";
import { deleteTodo, updateTodo } from "@/lib/todo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: { title?: string; completed?: boolean } = {};
  if (body && typeof body === "object") {
    const raw = body as { title?: unknown; completed?: unknown };
    if (typeof raw.title === "string") patch.title = raw.title;
    if (typeof raw.completed === "boolean") patch.completed = raw.completed;
  }

  if (patch.title === undefined && patch.completed === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const todo = updateTodo(id, patch);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ok = deleteTodo(id);
  if (!ok) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
