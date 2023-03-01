DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test

DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS comp_industry;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE comp_industry (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE
    
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('kaiser', 'Kaiser Permanente', 'Healthcare.'),
         ('fidelity', 'Fidelity Investments', 'Investment firm.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
          ('apple', 200, true, '2018-01-01'),
          ('kaiser', 300, false, null),
          ('fidelity', 400, false, null);
   
INSERT INTO industries (code, industry)
  VALUES ('tech', 'Technology'),
         ('health', 'Healthcare'),
         ('finance', 'Finance');

INSERT INTO comp_industry (comp_code, industry_code)
  VALUES ('apple', 'tech'),
         ('kaiser', 'health'),
         ('fidelity', 'finance');
