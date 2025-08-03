// Add this helper function to your component
export const parseTimeSpan = (timeSpanString) => {
  if (!timeSpanString) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Parse the TimeSpan format "d.hh:mm:ss"
  const parts = timeSpanString.split(".");
  const days = parseInt(parts[0], 10);

  if (parts.length > 1) {
    const timeParts = parts[1].split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    return { days, hours, minutes, seconds };
  }

  return { days, hours: 0, minutes: 0, seconds: 0 };
};

// Add this function to format the duration in a readable way
export const formatDuration = (timeSpanString) => {
  const { days, hours, minutes } = parseTimeSpan(timeSpanString);

  if (days > 0 && hours === 0 && minutes === 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }

  let result = "";
  if (days > 0) result += `${days} day${days !== 1 ? "s" : ""} `;
  if (hours > 0) result += `${hours} hour${hours !== 1 ? "s" : ""} `;
  if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? "s" : ""}`;

  return result.trim();
};
