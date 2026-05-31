import { createHash, timingSafeEqual, randomUUID } from "crypto";

export type UserId = string;

export type User = {
	id: UserId;
	email: string;
	name?: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateUserInput = {
	email: string;
	password: string;
	name?: string;
};

export type AddUserInput = {
	id?: UserId;
	email: string;
	name?: string;
	passwordHash: string;
	createdAt?: Date;
	updatedAt?: Date;
};

const hashPassword = (password: string) =>
	createHash("sha256").update(password).digest("hex");

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const safeCompare = (left: string, right: string) => {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);

	if (leftBuffer.length !== rightBuffer.length) {
		return false;
	}

	return timingSafeEqual(leftBuffer, rightBuffer);
};

class UserStore {
	private static instance: UserStore;

	private readonly users = new Map<UserId, User>();

	private constructor() {}

	static getInstance() {
		if (!UserStore.instance) {
			UserStore.instance = new UserStore();
		}

		return UserStore.instance;
	}

	createUser(input: CreateUserInput) {
		const email = normalizeEmail(input.email);

		if (this.findUserByEmail(email)) {
			throw new Error("User already exists");
		}

		const now = new Date();
		const user: User = {
			id: randomUUID(),
			email,
			name: input.name,
			passwordHash: hashPassword(input.password),
			createdAt: now,
			updatedAt: now,
		};

		this.users.set(user.id, user);

		return this.stripPassword(user);
	}

	addUser(input: AddUserInput) {
		const email = normalizeEmail(input.email);

		if (this.findUserByEmail(email)) {
			throw new Error("User already exists");
		}

		const user: User = {
			id: input.id ?? randomUUID(),
			email,
			name: input.name,
			passwordHash: input.passwordHash,
			createdAt: input.createdAt ?? new Date(),
			updatedAt: input.updatedAt ?? new Date(),
		};

		this.users.set(user.id, user);

		return this.stripPassword(user);
	}

	findUser(idOrEmail: string) {
		const normalized = normalizeEmail(idOrEmail);
		const user = this.users.get(idOrEmail) ?? this.findUserByEmail(normalized);

		return user ? this.stripPassword(user) : undefined;
	}

	verifyUser(email: string, password: string) {
		const user = this.findUserByEmail(normalizeEmail(email));

		if (!user) {
			return false;
		}

		return safeCompare(user.passwordHash, hashPassword(password));
	}

	listUser() {
		return this.listUsers();
	}

	listUsers() {
		return Array.from(this.users.values()).map((user) => this.stripPassword(user));
	}

	private findUserByEmail(email: string) {
		return Array.from(this.users.values()).find((user) => user.email === email);
	}

	private stripPassword(user: User) {
		const { passwordHash, ...safeUser } = user;
		return safeUser;
	}
}

export const userStore = UserStore.getInstance();
export { UserStore };
