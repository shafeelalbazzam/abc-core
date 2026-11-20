/**
 * WhatsApp-style date and time formatting utilities for Incident Chat
 */

export const getMessageDateObj = (msg, ticketFallbackDate) => {
  if (msg?.timestamp) {
    const d = new Date(msg.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof msg?.id === 'number' && msg.id > 1600000000000) {
    const d = new Date(msg.id);
    if (!isNaN(d.getTime())) return d;
  }
  if (msg?.created_at) {
    const d = new Date(msg.created_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (ticketFallbackDate) {
    const d = new Date(ticketFallbackDate);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export const getWhatsAppDateLabel = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return 'Today';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays > 1 && diffDays < 7) {
    // Within 1 week: show Day of Week (e.g. Wednesday, Tuesday, etc.)
    return dateObj.toLocaleDateString(undefined, { weekday: 'long' });
  }

  // After 1 week: show formatted date (e.g. 14 Nov 2026 or 14/11/2026)
  return dateObj.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatMessageTime = (dateObj, fallbackStr) => {
  if (dateObj && !isNaN(dateObj.getTime())) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return fallbackStr || 'Just now';
};

export const formatWhatsAppListTimestamp = (dateInput, fallbackDate) => {
  let dateObj = null;
  if (dateInput) {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) dateObj = d;
  }
  if (!dateObj && fallbackDate) {
    const d = new Date(fallbackDate);
    if (!isNaN(d.getTime())) dateObj = d;
  }
  if (!dateObj) {
    dateObj = new Date();
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) {
    return `Today, ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${timeStr}`;
  }
  if (diffDays > 1 && diffDays < 7) {
    const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    return `${weekday}, ${timeStr}`;
  }
  const datePart = dateObj.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
  return `${datePart}, ${timeStr}`;
};

/**
 * Group an array of timeline messages into chronological date buckets with WhatsApp dividers
 * Returns: [{ dateKey: '...', dateLabel: 'Today', messages: [...] }, ...]
 */
export const groupMessagesByDate = (messages = [], ticketCreatedDate) => {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const groups = [];
  let currentGroup = null;

  messages.forEach((msg) => {
    const dateObj = getMessageDateObj(msg, ticketCreatedDate);
    const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    const dateLabel = getWhatsAppDateLabel(dateObj);
    const formattedTime = formatMessageTime(dateObj, msg.time);

    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        dateKey,
        dateLabel,
        messages: []
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push({
      ...msg,
      _dateObj: dateObj,
      _formattedTime: formattedTime
    });
  });

  return groups;
};
