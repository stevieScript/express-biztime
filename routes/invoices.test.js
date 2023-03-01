const request = require("supertest");
process.env.NODE_ENV = "test";

const app = require("../app");
const db = require("../db");

let testInvoice;
let testCompany;
beforeEach(async () => {
    const company = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('test', 'Test Company', 'Test Description')
        RETURNING code, name, description;`);
    const invoice = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ('test', 100, false, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date;
    `);
    testCompany = company.rows[0];
    testInvoice = invoice.rows[0];
});

afterAll(async () => {
    await db.end();
});

afterEach(async () => {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
});

describe('GET /invoices', () => {
    test('Gets a list of 1 invoice', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            invoices: [{id: testInvoice.id, comp_code: testInvoice.comp_code, amt: testInvoice.amt, paid: testInvoice.paid, add_date: expect.any(String), paid_date: testInvoice.paid_date}]
        });
    });
});

describe('GET /invoices/:id', () => {
    test('Gets a single invoice', async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            invoice: {id: testInvoice.id, comp_code: testInvoice.comp_code, amt: testInvoice.amt, paid: testInvoice.paid, add_date: expect.any(String), paid_date: testInvoice.paid_date}
        });
    });
    test('Responds with 404 if can not find invoice', async () => {
        const res = await request(app).get(`/invoices/0`);
        expect(res.statusCode).toEqual(404);
    });
});

describe('POST /invoices', () => {
    test('Creates a new invoice', async () => {
        const res = await request(app).post('/invoices').send({comp_code: testCompany.code, amt: 200});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            invoice: {id: expect.any(Number), comp_code: testCompany.code, amt: 200, paid: false, add_date: expect.any(String), paid_date: null}
        });
    });
    test('Responds with 404 if can not find company', async () => {
        const res = await request(app).post('/invoices').send({comp_code: '7', amt: 200});
        expect(res.statusCode).toBe(500);
    });
});

describe('PUT /invoices/:id', () => {
    test('Updates an invoice', async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({amt: 300});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            invoice: {id: testInvoice.id, comp_code: testInvoice.comp_code, amt: 300, paid: testInvoice.paid, add_date: expect.any(String), paid_date: testInvoice.paid_date}
        });
    });
    test('Responds with 404 if can not find invoice', async () => {
        const res = await request(app).put(`/invoices/0`).send({amt: 300});
        expect(res.statusCode).toEqual(404);
    });
}); 

describe('DELETE /invoices/:id', () => {
    test('Deletes an invoice', async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({status: "deleted"});
    });
    test('Responds with 404 if can not find invoice', async () => {
        const res = await request(app).delete(`/invoices/0`);
        expect(res.statusCode).toEqual(404);
    });
});