const { EventEmitter } = require('events');

class UserTracker extends EventEmitter {
  trackAction(userId, action, metadata = {}) {
    const event = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
      id: Math.random().toString(36).substr(2, 9),
    };

    this.emit('user:action', event);
  }
}

module.exports = { UserTracker };
