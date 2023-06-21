export const createElement = (tag, className, content, attributes = {}) => {
  const element = document.createElement(tag);
  element.className = className;
  if (content) {
    element.textContent = content;
  }
  for (let key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return element;
};

export const formatDate = (data, showDayName) => {
  const date = new Date(data);
  const day = showDayName ? date.toLocaleDateString('default', { weekday: 'long' }) : null;
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const formattedDate = `${date.getDate()} ${month}, ${year}`;
  return {
    'day': day,
    'date': formattedDate
  };
};