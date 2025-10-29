import { Request, Response } from 'express';

let users = [
  { id: 1, name: 'Minh', email: 'minh.le4@ucalgary.ca' }
];

export const getUsers = (_req: Request, res: Response) => {
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }

  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
};
