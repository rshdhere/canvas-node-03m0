export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type CreateTodoInput = {
  title: string;
};

export type UpdateTodoInput = {
  title?: string;
  completed?: boolean;
};
