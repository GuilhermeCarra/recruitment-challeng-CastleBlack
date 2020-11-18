require('dotenv').config();
const request = require("supertest");
const api = request('http://localhost:8080/api');

describe("GET / players ", () => {
	test("It should respond with 401 (no authorization header)", async () => {
		const response = await api.get("/players");
		expect(response.statusCode).toBe(401);
	});
});

describe("GET / players ", () => {
	test("It should respond respond with an list of players", async () => {
		const response = await api
			.get("/players")
			.set({ 'Authorization': `Bearer ${process.env.AUTH_TOKEN}`, Accept: 'application/json' });

		expect(response.statusCode).toBe(200);
		expect(response.body.error).toBeNull();
		expect(response.body.data).not.toBeNull();
	});
});

describe("POST / objects ", () => {
	test("It should fail at object creation (missing value number)", async () => {
		const response = await api
			.post("/objects")
			.set({ 'Authorization': `Bearer ${process.env.AUTH_TOKEN}`, Accept: 'application/json' })
			.send({name: 'shield'})

		expect(response.statusCode).toBe(400);
		expect(response.body.data).toBeNull();
		expect(response.body.error).not.toBeNull();
	});
});