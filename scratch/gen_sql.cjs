const fs = require('fs');
const path = require('path');

const csvPath = 'teachers.csv';
const sqlPath = 'import_teachers.sql';

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim().length > 0);
const headers = lines[0].split(',');

const sqlLines = [
    `-- Cleanup`,
    `DROP TABLE IF EXISTS teachers;`,
    `DROP TABLE IF EXISTS faculty_schedules;`,
    ``,
    `-- Create Tables`,
    `CREATE TABLE teachers (`,
    `    id TEXT PRIMARY KEY,`,
    `    name TEXT NOT NULL,`,
    `    department TEXT,`,
    `    access_code TEXT UNIQUE NOT NULL`,
    `);`,
    ``,
    `CREATE TABLE faculty_schedules (`,
    `    id TEXT PRIMARY KEY,`,
    `    name TEXT NOT NULL,`,
    `    department TEXT,`,
    `    schedule TEXT DEFAULT '{}'`,
    `);`,
    ``,
    `-- Insert Records`
];

for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/'/g, "''"));
    if (values.length < 4) continue;
    
    const [id, name, department, access_code] = values;
    
    sqlLines.push(`INSERT INTO teachers (id, name, department, access_code) VALUES ('${id}', '${name}', '${department}', '${access_code}');`);
    sqlLines.push(`INSERT INTO faculty_schedules (id, name, department) VALUES ('${id}', '${name}', '${department}');`);
}

fs.writeFileSync(sqlPath, sqlLines.join('\n'));
console.log('SQL Generated: import_teachers.sql');
