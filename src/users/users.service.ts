import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'Admin',
    },
    {
      id: 2,
      name: 'Brian Lee',
      email: 'brian.lee@example.com',
      role: 'Intern',
    },
    {
      id: 3,
      name: 'Clara Smith',
      email: 'clara.smith@example.com',
      role: 'Admin',
    },
    {
      id: 4,
      name: 'David Nguyen',
      email: 'david.nguyen@example.com',
      role: 'Intern',
    },
    {
      id: 5,
      name: 'Ella Martinez',
      email: 'ella.martinez@example.com',
      role: 'Admin',
    },
    {
      id: 6,
      name: 'Felix Anderson',
      email: 'felix.anderson@example.com',
      role: 'Intern',
    },
    { id: 7, name: 'Grace Kim', email: 'grace.kim@example.com', role: 'Admin' },
    {
      id: 8,
      name: 'Henry Brown',
      email: 'henry.brown@example.com',
      role: 'Intern',
    },
    {
      id: 9,
      name: 'Ivy Wilson',
      email: 'ivy.wilson@example.com',
      role: 'Admin',
    },
    {
      id: 10,
      name: 'Jack Davis',
      email: 'jack.davis@example.com',
      role: 'Intern',
    },
  ];

  findAll(keywords?: string, role?: 'Intern' | 'Admin') {
    if (keywords) {
      const data = this.users.filter((user) => user.name === keywords);
      if (!data.length) {
        throw new NotFoundException('User not found!');
      }
      return data;
    }
    if (role) {
      const data = this.users.filter((user) => user.role === role);
      if (!data.length) {
        throw new NotFoundException('User not found!');
      }
      return data;
    }
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  create(user: CreateUserDto) {
    const userByHighestId = [...this.users].sort((a, b) => b.id - a.id);
    const newUser = {
      id: userByHighestId[0].id + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updatedUser: UpdateUserDto) {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        console.log(user);
        return { ...user, ...updatedUser };
      }
      return user;
    });

    return this.findOne(id);
  }

  delete(id: number) {
    const removedUser = this.findOne(id);

    this.users = this.users.filter((user) => user.id !== id);

    return removedUser;
  }
}
