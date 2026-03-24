import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export function getFilms() {
  const filePath = path.join(DATA_DIR, 'films.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function saveFilms(films: any[]) {
  const filePath = path.join(DATA_DIR, 'films.json');
  fs.writeFileSync(filePath, JSON.stringify(films, null, 2), 'utf8');
}

export function getTeam() {
  const filePath = path.join(DATA_DIR, 'team.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function saveTeam(team: any[]) {
  const filePath = path.join(DATA_DIR, 'team.json');
  fs.writeFileSync(filePath, JSON.stringify(team, null, 2), 'utf8');
}

export function getConfig() {
  const filePath = path.join(DATA_DIR, 'config.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function saveConfig(config: any) {
  const filePath = path.join(DATA_DIR, 'config.json');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}

export function getUsers() {
  const filePath = path.join(DATA_DIR, 'users.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function saveUsers(users: any[]) {
  const filePath = path.join(DATA_DIR, 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}


