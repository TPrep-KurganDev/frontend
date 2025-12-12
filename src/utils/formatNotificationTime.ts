export function formatNotificationTime(timeString: string): string {
  const targetDate = new Date(timeString + 'Z');
  const now = new Date();

  const diffMs = targetDate.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeUntilText = '';

  if (diffSeconds <= 0) {
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    const timeOfDay = `${hours}:${minutes}`;

    const isToday = targetDate.toDateString() === now.toDateString();
    const dayText = isToday ? 'сегодня' : targetDate.toLocaleDateString('ru-RU');

    return `Уведомление отправлено\n${dayText} в ${timeOfDay}`;
  }

  if (diffSeconds < 60) {
    const secondWord = getSecondWord(diffSeconds);
    timeUntilText = `через ${diffSeconds} ${secondWord}`;
  } else if (diffMinutes < 60) {
    const remainingSeconds = diffSeconds % 60;
    const minuteWord = getMinuteWord(diffMinutes);
    const secondWord = getSecondWord(remainingSeconds);

    if (remainingSeconds > 0) {
      timeUntilText = `через ${diffMinutes} ${minuteWord} ${remainingSeconds} ${secondWord}`;
    } else {
      timeUntilText = `через ${diffMinutes} ${minuteWord}`;
    }
  } else if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    const hourWord = getHourWord(diffHours);
    const minuteWord = getMinuteWord(remainingMinutes);

    if (remainingMinutes > 0) {
      timeUntilText = `через ${diffHours} ${hourWord} ${remainingMinutes} ${minuteWord}`;
    } else {
      timeUntilText = `через ${diffHours} ${hourWord}`;
    }
  } else {
    const dayWord = getDayWord(diffDays);
    timeUntilText = `через ${diffDays} ${dayWord}`;
  }

  const hours = targetDate.getHours().toString().padStart(2, '0');
  const minutes = targetDate.getMinutes().toString().padStart(2, '0');
  const timeOfDay = `${hours}:${minutes}`;

  const isToday = targetDate.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === targetDate.toDateString();

  let dayText: string;
  if (isToday) {
    dayText = 'сегодня';
  } else if (isTomorrow) {
    dayText = 'завтра';
  } else {
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    dayText = `${day}.${month}`;
  }

  return `Следующее повторение ${timeUntilText}\n${dayText} в ${timeOfDay}`;
}

function getSecondWord(seconds: number): string {
  const lastDigit = seconds % 10;
  const lastTwoDigits = seconds % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'секунд';
  }

  if (lastDigit === 1) {
    return 'секунду';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'секунды';
  }

  return 'секунд';
}

function getMinuteWord(minutes: number): string {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'минут';
  }

  if (lastDigit === 1) {
    return 'минуту';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'минуты';
  }

  return 'минут';
}

function getHourWord(hours: number): string {
  const lastDigit = hours % 10;
  const lastTwoDigits = hours % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'часов';
  }

  if (lastDigit === 1) {
    return 'час';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'часа';
  }

  return 'часов';
}

function getDayWord(days: number): string {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней';
  }

  if (lastDigit === 1) {
    return 'день';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }

  return 'дней';
}
