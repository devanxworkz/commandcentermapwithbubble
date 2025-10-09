// Utility: batch incoming "message" events to avoid blocking UI
export function setupMessageBatch(processBatch, interval = 300) {
  let queue = [];
  let timer = null;

  const handler = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      queue.push(parsed);
    } catch (err) {
      console.warn("Invalid message:", event.data);
    }
  };

  window.addEventListener("message", handler);

  timer = setInterval(() => {
    if (queue.length > 0) {
      processBatch(queue);
      queue = [];
    }
  }, interval);

  return () => {
    window.removeEventListener("message", handler);
    clearInterval(timer);
  };
}
