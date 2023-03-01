const request = require("supertest");
process.env.NODE_ENV = "test";

const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
    const result = await db.query(`Insert into companies (code, name, description) VALUES ('test', 'TESTING', 'Maker of TEST.') RETURNING code, name, description`);
    testCompany = result.rows[0];
});

afterAll(async () => {
    await db.end();
});

afterEach(async () => {
    await db.query("DELETE FROM companies");
});

describe('GET /companies', () => {
    test('Gets a list of 1 company', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            companies: [{code: 'test', name: 'TESTING', description: 'Maker of TEST.'}]
        });
    });
});

describe('GET /companies/:code', () => {
    test('Gets a single company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            company: {code: 'test', name: 'TESTING', description: 'Maker of TEST.'}
        });
    });
    test('Responds with 404 if can not find company', async () => {
        const res = await request(app).get(`/companies/0`);
        expect(res.statusCode).toEqual(404);
    });
});

describe('POST /companies', () => {
    test('Creates a new company', async () => {
        const res = await request(app).post('/companies').send({code: 'new', name: 'New', description: 'New company'});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            company: {code: 'new', name: 'New', description: 'New company'}
        });
    });
});

describe('PUT /companies/:code', () => {
    test('Updates a single company', async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name: 'New', description: 'New company'});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            company: {code: 'test', name: 'New', description: 'New company'}
        });
    });
    test('Responds with 404 if can not find company', async () => {
        const res = await request(app).put(`/companies/0`).send({name: 'New', description: 'New company'});
        expect(res.statusCode).toEqual(404);
    });
});

describe('DELETE /companies/:code', () => {
    test('Deletes a single company', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({status: 'deleted'});
    });
    test('Responds with 404 if can not find company', async () => {
        const res = await request(app).delete(`/companies/0`);
        expect(res.statusCode).toEqual(404);
    });
});