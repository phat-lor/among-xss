export const niggafyAuth = (input: string, read: boolean = false) => {
	let output = input;

	for (let i = 0; i < 5; i++) {
		output = read ? atob(output) : btoa(output);
	}

	return output;
};
