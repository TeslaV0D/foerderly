/**
 * Parse antragsfrist (DD.MM.YYYY or "laufend") and return urgency status.
 * Pure function — safe to import from both server and client components.
 */
export function getDeadlineStatus(antragsfrist) {
  if (!antragsfrist) return { urgency: 'none', daysLeft: null, isLaufend: false };

  const isLaufend = antragsfrist === 'laufend';
  if (isLaufend) return { urgency: 'laufend', daysLeft: null, isLaufend: true };

  const parts = antragsfrist.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!parts) return { urgency: 'none', daysLeft: null, isLaufend: false };

  const deadline = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  let urgency = 'green';
  if (daysLeft < 0) urgency = 'expired';
  else if (daysLeft <= 30) urgency = 'red';
  else if (daysLeft <= 90) urgency = 'yellow';

  return { urgency, daysLeft, isLaufend: false };
}
