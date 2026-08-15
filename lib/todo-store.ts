import type { Todo } from "@/lib/types";

const globalForTodos = globalThis as unknown as {
  __todoStore?: Todo[];
};

function store(): Todo[] {
  if (!globalForTodos.__todoStore) {
    globalForTodos.__todoStore = [
      {
        id: crypto.randomUUID(),
        title: "Welcome — add your first task",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: "Mark tasks done when you finish them",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return globalForTodos.__todoStore;
}

export function listTodos(): Todo[] {
  return [...store()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createTodo(title: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  store().unshift(todo);
  return todo;
}

export function updateTodo(
  id: string,
  patch: { title?: string; completed?: boolean }
): Todo | null {
  const todos = store();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const current = todos[index];
  const next: Todo = {
    ...current,
    title:
      patch.title !== undefined ? patch.title.trim() : current.title,
    completed:
      patch.completed !== undefined ? patch.completed : current.completed,
  };
  if (!next.title) return null;
  todos[index] = next;
  return next;
}

export function deleteTodo(id: string): boolean {
  const todos = store();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

export function clearCompleted(): number {
  const todos = store();
  const before = todos.length;
  globalForTodos.__todoStore = todos.filter((t) => !t.completed);
  return before - (globalForTodos.__todoStore?.length ?? 0);
}
