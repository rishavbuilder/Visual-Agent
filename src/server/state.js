const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

let editHistory = [];

function getPendingDir() {
  return path.join(process.cwd(), '.visual-agent', 'pending');
}

function getAppliedDir() {
  return path.join(process.cwd(), '.visual-agent', 'applied');
}

function ensureDirectories() {
  const pendingDir = getPendingDir();
  const appliedDir = getAppliedDir();
  
  if (!fs.existsSync(pendingDir)) {
    fs.mkdirSync(pendingDir, { recursive: true });
  }
  if (!fs.existsSync(appliedDir)) {
    fs.mkdirSync(appliedDir, { recursive: true });
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function addPendingChange(change) {
  ensureDirectories();
  
  const id = generateId();
  const filePath = path.join(getPendingDir(), `${id}.json`);
  
  const changeData = {
    ...change,
    id,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(filePath, JSON.stringify(changeData, null, 2), 'utf8');
  console.log(chalk.gray(`  Saved change: ${change.description || change.property || 'edit'}`));
  
  return changeData;
}

function getPendingChanges() {
  ensureDirectories();
  
  const files = fs.readdirSync(getPendingDir()).filter(f => f.endsWith('.json'));
  const changes = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(getPendingDir(), file);
      const content = fs.readFileSync(filePath, 'utf8');
      changes.push(JSON.parse(content));
    } catch (e) {
      console.error(chalk.red(`  Error reading ${file}: ${e.message}`));
    }
  }
  
  return changes;
}

function getPendingChangeById(id) {
  const filePath = path.join(getPendingDir(), `${id}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }
  return null;
}

function deletePendingChange(id) {
  const filePath = path.join(getPendingDir(), `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function clearPendingChanges() {
  ensureDirectories();
  
  const files = fs.readdirSync(getPendingDir()).filter(f => f.endsWith('.json'));
  for (const file of files) {
    fs.unlinkSync(path.join(getPendingDir(), file));
  }
}

function addToHistory(entry) {
  editHistory.push({
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString()
  });

  if (editHistory.length > 100) {
    editHistory = editHistory.slice(-100);
  }
}

function getHistory() {
  return [...editHistory];
}

function getPendingCount() {
  ensureDirectories();
  return fs.readdirSync(getPendingDir()).filter(f => f.endsWith('.json')).length;
}

module.exports = {
  addPendingChange,
  getPendingChanges,
  getPendingChangeById,
  deletePendingChange,
  clearPendingChanges,
  addToHistory,
  getHistory,
  getPendingCount,
  getPendingDir,
  getAppliedDir
};
