const WebSocket = require('ws');
const chalk = require('chalk');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(chalk.gray('  Client connected'));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(message, ws, clients);
      } catch (error) {
        console.error(chalk.red('  Invalid message:', error.message));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(chalk.gray('  Client disconnected'));
    });

    ws.on('error', (error) => {
      console.error(chalk.red('  WebSocket error:', error.message));
      clients.delete(ws);
    });

    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: Date.now()
    }));
  });

  return {
    broadcast(message) {
      const data = JSON.stringify(message);
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    },

    getClientCount() {
      return clients.size;
    }
  };
}

function handleMessage(message, ws, clients) {
  switch (message.type) {
    case 'element_selected':
      console.log(chalk.cyan(`  Element selected: ${message.selector}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'property_change':
      console.log(chalk.cyan(`  Property change: ${message.property} ${message.oldValue} → ${message.newValue}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'element_move':
      console.log(chalk.cyan(`  Element moved: ${message.selector}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'element_resize':
      console.log(chalk.cyan(`  Element resized: ${message.selector}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'text_edit':
      console.log(chalk.cyan(`  Text edited: ${message.selector}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'style_change':
      console.log(chalk.cyan(`  Style changed: ${message.selector}`));
      broadcastToOthers(ws, message, clients);
      break;

    case 'undo':
      console.log(chalk.gray('  Undo requested'));
      broadcastToOthers(ws, message, clients);
      break;

    case 'redo':
      console.log(chalk.gray('  Redo requested'));
      broadcastToOthers(ws, message, clients);
      break;

    default:
      console.log(chalk.gray(`  Unknown message type: ${message.type}`));
  }
}

function broadcastToOthers(sender, message, clients) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

module.exports = { setupWebSocket };
