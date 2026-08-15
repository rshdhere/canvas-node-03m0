"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ListTodo, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "completed";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadTodos = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to load todos");
      const data = (await res.json()) as { todos: Todo[] };
      setTodos(data.todos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - remaining;

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: value }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Could not add todo");
      }
      const data = (await res.json()) as { todo: Todo };
      setTodos((prev) => [data.todo, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add todo");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      )
    );
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = (await res.json()) as { todo: Todo };
      setTodos((prev) => prev.map((t) => (t.id === data.todo.id ? data.todo : t)));
    } catch {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t
        )
      );
      setError("Could not update todo");
    }
  }

  async function removeTodo(id: string) {
    const previous = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setTodos(previous);
      setError("Could not delete todo");
    }
  }

  async function saveEdit(id: string) {
    const value = editTitle.trim();
    if (!value) return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: value }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = (await res.json()) as { todo: Todo };
      setTodos((prev) => prev.map((t) => (t.id === data.todo.id ? data.todo : t)));
      setEditingId(null);
      setEditTitle("");
    } catch {
      setError("Could not rename todo");
    }
  }

  async function clearCompleted() {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearCompleted" }),
      });
      if (!res.ok) throw new Error("Clear failed");
      const data = (await res.json()) as { todos: Todo[] };
      setTodos(data.todos);
    } catch {
      setError("Could not clear completed todos");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10 sm:py-14">
      <header className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-medium text-teal-800">
          <ListTodo className="size-3.5" aria-hidden />
          Todo
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Focus list
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Capture tasks, check them off, and keep the day moving.
        </p>
      </header>

      <section
        aria-label="Todo workspace"
        className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/60 backdrop-blur sm:p-6"
      >
        <form onSubmit={addTodo} className="flex gap-2">
          <label htmlFor="new-todo" className="sr-only">
            New todo
          </label>
          <Input
            id="new-todo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            maxLength={200}
            autoComplete="off"
            disabled={saving}
          />
          <Button
            type="submit"
            size="lg"
            disabled={saving || !title.trim()}
            className="bg-teal-700 text-white hover:bg-teal-800"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            Add
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter todos"
            className="flex rounded-lg border border-slate-200 bg-slate-50 p-1"
          >
            {([
              ["all", "All"],
              ["active", "Active"],
              ["completed", "Done"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  filter === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">
            {remaining} left
            {completedCount > 0 ? ` · ${completedCount} done` : null}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <ul className="mt-4 divide-y divide-slate-100" aria-live="polite">
          {loading ? (
            <li className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading todos…
            </li>
          ) : filtered.length === 0 ? (
            <li className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-500">
              <CheckCircle2 className="size-8 text-teal-500" aria-hidden />
              {filter === "completed"
                ? "No completed tasks yet."
                : filter === "active"
                  ? "Nothing active — enjoy the calm."
                  : "No tasks yet. Add one above."}
            </li>
          ) : (
            filtered.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => void toggleTodo(todo)}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? "active" : "completed"}`}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  {editingId === todo.id ? (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void saveEdit(todo.id);
                      }}
                    >
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        aria-label="Edit todo title"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditTitle("");
                          }
                        }}
                      />
                      <Button type="submit" size="sm" className="bg-teal-700 text-white hover:bg-teal-800">
                        Save
                      </Button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onDoubleClick={() => {
                        setEditingId(todo.id);
                        setEditTitle(todo.title);
                      }}
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditTitle(todo.title);
                      }}
                      className={cn(
                        "w-full rounded-md px-1 py-0.5 text-left text-sm leading-6 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
                        todo.completed && "text-slate-400 line-through"
                      )}
                    >
                      {todo.title}
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete "${todo.title}"`}
                  onClick={() => void removeTodo(todo.id)}
                  className="opacity-70 hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))
          )}
        </ul>

        {completedCount > 0 ? (
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void clearCompleted()}
            >
              Clear completed
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
