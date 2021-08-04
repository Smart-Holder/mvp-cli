
export interface User {
	address: string;
}

export interface APIUser {

	user(): Promise<User>;

	address(): Promise<string>;

	addressNoJump(): string;

}